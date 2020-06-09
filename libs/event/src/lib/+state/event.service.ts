import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, Query, WriteOptions, queryChanges } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { EventDocument, EventBase, EventTypes } from './event.firestore';
import { Event, ScreeningEvent, createCalendarEvent, EventsAnalytics, MeetingEvent, isMeeting, isScreening } from './event.model';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { AngularFireFunctions } from '@angular/fire/functions';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { PermissionsService, PermissionsQuery } from '@blockframes/permissions/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { EventQuery } from './event.query';
import { Observable, combineLatest } from 'rxjs';
import { filter, switchMap, tap, map } from 'rxjs/operators';

const eventQuery = (id: string) => ({
  path: `events/${id}`,
  org: ({ ownerId }: ScreeningEvent) => ({ path: `orgs/${ownerId}` }),
  movie: (event: Event) => {
    if (isScreening(event)) {
      return event.meta.titleId ? { path: `movies/${event.meta.titleId}` } : undefined
    }
  },
  organizedBy: (event: Event) => {
    if (isMeeting(event)) {
      return event.meta.organizerId ? { path: `users/${event.meta.organizerId}` } : undefined
    }
  }
})

/** Hold all the different queries for an event */
const eventQueries = {
  // Screening
  screening: (queryFn: QueryFn = (ref) => ref): Query<ScreeningEvent> => ({
    path: 'events',
    queryFn: ref => queryFn(ref).where('type', '==', 'screening'),
    movie: ({ meta }: ScreeningEvent) =>  {
      return meta.titleId ? { path: `movies/${meta.titleId}` } : undefined
    },
    org: (e: ScreeningEvent) => ({ path: `orgs/${e.ownerId}` }),
  }),

  // Meeting
  meeting: (queryFn: QueryFn = (ref) => ref): Query<MeetingEvent> => ({
    path: 'events',
    queryFn: ref => queryFn(ref).where('type', '==', 'meeting'),
    org: ({ ownerId }: MeetingEvent) => ({ path: `orgs/${ownerId}` }),
  })
}


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {
  private analytics: Record<string, EventsAnalytics> = {};

  constructor(
    protected store: EventStore,
    private functions: AngularFireFunctions,
    private permissionsService: PermissionsService,
    private invitationService: InvitationService,
    private permissionQuery: PermissionsQuery,
    private query: EventQuery,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery,
  ) {
    super(store);
  }

  public async queryAnalytics(eventId: string): Promise<EventsAnalytics> {
    if (this.analytics[eventId]) {
      return this.analytics[eventId];
    } else {
      const f = this.functions.httpsCallable('getEventAnalytics');
      const analytics = await f({ eventIds: [eventId] }).toPromise();
      const eventAnalytics = analytics.find(a => a.eventId === eventId);
      this.analytics[eventId] = eventAnalytics;
      return eventAnalytics;
    }
  }

  /** Verify if the current user / organisation is ownr of an event */
  isOwner(event: EventBase<any, any>) {
    const isUser = event.ownerId === this.authQuery.userId;
    const isOrgAdmin = (event.ownerId === this.orgQuery.getActiveId()) && this.permissionQuery.isUserAdmin();
    return isUser || isOrgAdmin;
  }

  /** Create the permission */
  async onCreate(event: Event, { write }: WriteOptions) {
    return this.permissionsService.addDocumentPermissions(event.id, write);
  }

  /** Remove all invitations & notifications linked to this event */
  async onDelete(id: string, { write }: WriteOptions) {
    const invitations = await this.invitationService.getValue(ref => ref.where('type', '==', 'attendEvent').where('docId', '==', id));
    await this.invitationService.remove(invitations.map(e => e.id), { write });
  }

  formatToFirestore(event: Event) {
    const e = { ...event };
    // Remove frontend values
    delete e.draggable;
    delete e.resizable;
    delete e.color;
    delete e.cssClass;
    delete e.isOwner;
    return e;
  }

  formatFromFirestore<T>(event: EventDocument<T>): Event<T> {
    return createCalendarEvent(event, this.isOwner(event));
  }

  /** Query events based on types */
  queryByType(types: EventTypes[], queryFn?: QueryFn): Observable<Event[]> {
    const queries = types.map(type => eventQueries[type](queryFn));
    const queries$ = queries.map(query => queryChanges.call(this, query))
    return combineLatest(queries$).pipe(
      map((results) => results.flat())
    );
  }

  /** Query one or many event by id */
  queryDocs(ids: string[]): Observable<Event[]>
  queryDocs(ids: string): Observable<Event>
  queryDocs(ids: string | string[]): Observable<Event | Event[]> {
    if (typeof ids === 'string') {
      return queryChanges.call(this, eventQuery(ids))
    } else {
      const queries = ids.map(id => queryChanges.call(this, eventQuery(id)))
      return combineLatest(queries);
    }
  }

  /** Call a firebase function to get analytics specify to an array of eventIds.*/
  public getEventAnalytics(eventIds: string[]): Observable<EventsAnalytics[]> {
    const f = this.functions.httpsCallable('getEventAnalytics');
    return f({ eventIds });
  }
}
