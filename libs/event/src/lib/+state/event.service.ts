import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, Query, WriteOptions, queryChanges } from 'akita-ng-fire';
import {
  EventDocument,
  EventBase,
  EventTypes,
  Event,
  ScreeningEvent,
  createCalendarEvent,
  MeetingEvent,
  isMeeting,
  isScreening,
  SlateEvent,
  Timestamp
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { PermissionsService } from '@blockframes/permissions/+state';
import { Observable, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ActiveState, EntityState } from '@datorama/akita';
import { production } from '@env';
import { QueryConstraint, where } from 'firebase/firestore';

interface EventState extends EntityState<Event>, ActiveState<string> { };

const eventQuery = (id: string) => ({
  path: `events/${id}`,
  org: ({ ownerOrgId }: ScreeningEvent) => ({ path: `orgs/${ownerOrgId}` }),
  movie: (event: Event) => {
    if (isScreening(event)) {
      return event.meta.titleId ? { path: `movies/${event.meta.titleId}` } : undefined
    }
  },
  organizedBy: (event: Event) => {
    if (isMeeting(event)) {
      return event.meta.organizerUid ? { path: `users/${event.meta.organizerUid}` } : undefined
    }
  }
})

/** Hold all the different queries for an event */
const eventQueries = {
  // Screening
  screening: (queryConstraints: QueryConstraint[]): Query<ScreeningEvent> => ({
    path: 'events',
    queryConstraints: queryConstraints.concat([where('type', '==', 'screening')]),
    movie: ({ meta }: ScreeningEvent) => {
      return meta?.titleId ? { path: `movies/${meta.titleId}` } : undefined
    },
    org: (e: ScreeningEvent) => ({ path: `orgs/${e.ownerOrgId}` }),
  }),

  // Meeting
  meeting: (queryConstraints: QueryConstraint[]): Query<MeetingEvent> => ({
    path: 'events',
    queryConstraints: queryConstraints.concat([where('type', '==', 'meeting')]),
    org: ({ ownerOrgId }: MeetingEvent) => ({ path: `orgs/${ownerOrgId}` }),
  }),

  slate: (queryConstraints: QueryConstraint[]): Query<SlateEvent> => ({
    path: 'events',
    queryConstraints: queryConstraints.concat([where('type', '==', 'slate')]),
    org: ({ ownerOrgId }: SlateEvent) => ({ path: `orgs/${ownerOrgId}` }),
  }),
}

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {
  readonly useMemorization = false;

  constructor(
    private permissionsService: PermissionsService,
    private orgService: OrganizationService,
  ) {
    super();
    if (!production && window['Cypress']) window['eventService'] = this; // instrument Cypress only out of PROD
  }

  /** Verify if the current user / organization is owner of an event */
  isOwner(event: EventBase<Date | Timestamp, unknown>) {
    return event?.ownerOrgId === this.orgService.org?.id;
  }

  /** Create the permission */
  async onCreate(event: Event, { write }: WriteOptions) {
    return this.permissionsService.addDocumentPermissions(event.id, write, this.orgService.org.id);
  }

  formatToFirestore(event: Event) {
    const e = { ...event };
    // Remove frontend values
    delete e.draggable;
    delete e.resizable;
    delete e.color;
    delete e.cssClass;
    delete e.isOwner;
    delete e.movie;
    delete e.organizedBy;
    delete e.org;

    return e;
  }

  formatFromFirestore<T>(event: EventDocument<T>): Event<T> {
    return createCalendarEvent(event, this.isOwner(event));
  }

  /** Query events based on types */
  queryByType(types: EventTypes[], queryConstraints?: QueryConstraint[]): Observable<Event[]> {
    const queries = types.map(type => eventQueries[type](queryConstraints));
    const queries$ = queries.map(query => queryChanges.call(this, query));
    return combineLatest(queries$).pipe(
      map((results) => results.flat()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  /** Query one or many event by id */
  queryDocs(ids: string[]): Observable<Event[]>
  queryDocs(ids: string): Observable<Event>
  queryDocs(ids: string | string[]): Observable<Event | Event[]> {
    if (typeof ids === 'string') {
      return queryChanges.call(this, eventQuery(ids))
    } else if (ids.length === 0) {
      return of([]);
    } else {
      const queries = ids.map(id => queryChanges.call(this, eventQuery(id)))
      return combineLatest(queries);
    }
  }

  /** Just save local time so we will be able to compute session duration at the end */
  public startLocalSession() {
    sessionStorage.setItem('localSessionStart', Date.now().toString());
  }

  public getLocalSession() {
    return parseInt(sessionStorage.getItem('localSessionStart'), 10);
  }
}
