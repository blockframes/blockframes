import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, syncQuery, Query, WriteOptions, queryChanges } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { EventDocument, EventBase, EventTypes } from './event.firestore';
import { Event, ScreeningEvent, createCalendarEvent, EventsAnalytics, MeetingEvent } from './event.model';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { Observable } from 'rxjs';
import { AngularFireFunctions } from '@angular/fire/functions';
import { InvitationService } from '@blockframes/invitation/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { AuthQuery } from '@blockframes/auth/+state';
import { combineLatest } from 'rxjs';
import { EventQuery } from './event.query';
import { filter, switchMap, tap, map } from 'rxjs/operators';

/** Hold all the different queries for an event */
const eventQueries = {
  screening: (queryFn: QueryFn = (ref) => ref): Query<ScreeningEvent> => ({
    path: 'events',
    queryFn: ref => queryFn(ref).where('type', '==', 'screening'),
    movie: ({ meta }: ScreeningEvent) =>  {
      return meta.titleId ? { path: `movies/${meta.titleId}` } : undefined
    },
    org: ({ ownerId }: ScreeningEvent) => ({ path: `orgs/${ownerId}` }),
  }),
  meeting: (queryFn: QueryFn = (ref) => ref): Query<MeetingEvent> => ({
    path: 'events',
    queryFn: ref => queryFn(ref).where('type', '==', 'meeting'),
    org: ({ ownerId }: MeetingEvent) => ({ path: `orgs/${ownerId}` }),
  })
}

const screeningsQuery = (queryFn: QueryFn = (ref) => ref): Query<ScreeningEvent> => ({
  path: 'events',
  queryFn: ref => queryFn(ref).where('type', '==', 'screening'),
  movie: ({ meta }: ScreeningEvent) =>  {
    return meta.titleId ? { path: `movies/${meta.titleId}` } : undefined
  },
  org: ({ ownerId }: ScreeningEvent) => ({ path: `orgs/${ownerId}` }),
});


@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {

  constructor(
    protected store: EventStore,
    private functions: AngularFireFunctions,
    private invitationService: InvitationService,
    private query: EventQuery,
    private authQuery: AuthQuery,
    private orgQuery: OrganizationQuery,
  ) {
    super(store);
  }

  /** Gets analytics for one event and sync them. */
  public syncEventAnalytics() {
    return combineLatest([
      this.query.selectActiveId(),
      this.query.analytics.select('ids')
    ]).pipe(
      filter(([eventId, analyticsIds]) => !analyticsIds.includes(eventId)),
      switchMap(([eventId]) => {
        this.store.analytics.setActive(eventId);
        const f = this.functions.httpsCallable('getEventAnalytics');
        return f({ eventIds: [eventId] });
      }),
      tap(analytics => {
        this.store.analytics.upsertMany(analytics);
      })
    )
  }

  /** Verify if the current user / organisation is ownr of an event */
  isOwner(event: EventBase<any, any>) {
    return event.ownerId === this.authQuery.userId || event.ownerId === this.orgQuery.getActiveId();
  }

  /** Remove all invitations & notifications linked to this event */
  async onDelete(id: string, { write }: WriteOptions) {
    const invitations = await this.invitationService.getValue(ref => ref.where('docId', '==', id));
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

  /**
   * Set event private url
   * The url will be fetched from Movie private config associated to eventId
   * @param eventId
   */
  // @TODO (#2460)  Waiting for a decision on screening flow before uncomment
  public setEventUrl(eventId: string): Promise<any> {
    const f = this.functions.httpsCallable('setEventUrl');
    return f({ eventId }).toPromise();
  }

  /** Call a firebase function to get analytics specify to an array of eventIds.*/
  public getEventAnalytics(eventIds: string[]): Observable<EventsAnalytics[]> {
    const f = this.functions.httpsCallable('getEventAnalytics');
    return f({ eventIds });
  }
}
