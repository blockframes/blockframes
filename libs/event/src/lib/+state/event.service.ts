import { Injectable } from '@angular/core';
import {
  EventBase,
  EventTypes,
  Event,
  ScreeningEvent,
  createCalendarEvent,
  MeetingEvent,
  isMeeting,
  isScreening,
  SlateEvent,
  Timestamp,
  EventMeta
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { PermissionsService } from '@blockframes/permissions/+state/permissions.service';
import { Observable, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { production } from '@env';
import { DocumentSnapshot, QueryConstraint, where } from 'firebase/firestore';
import { WriteOptions } from 'ngfire';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { UserService } from '@blockframes/user/+state/user.service';
import { joinWith } from 'ngfire';
import { BlockframesCollection } from '@blockframes/utils/abstract-service';

@Injectable({ providedIn: 'root' })
export class EventService extends BlockframesCollection<Event> {
  readonly path = 'events';

  private eventQueries = {
    // Screening
    screening: (queryConstraints: QueryConstraint[]) => {
      return this.valueChanges(queryConstraints.concat([where('type', '==', 'screening')])).pipe(
        joinWith({
          org: ({ ownerOrgId }: ScreeningEvent) => this.orgService.valueChanges(ownerOrgId),
          movie: ({ meta }: ScreeningEvent) => {
            return meta?.titleId ? this.movieService.valueChanges(meta.titleId) : undefined;
          },
        })
      )
    },
    // Meeting
    meeting: (queryConstraints: QueryConstraint[]) => {
      return this.valueChanges(queryConstraints.concat([where('type', '==', 'meeting')])).pipe(
        joinWith({
          org: ({ ownerOrgId }: MeetingEvent) => this.orgService.valueChanges(ownerOrgId),
        })
      )
    },
    // Slate
    slate: (queryConstraints: QueryConstraint[]) => {
      return this.valueChanges(queryConstraints.concat([where('type', '==', 'slate')])).pipe(
        joinWith({
          org: ({ ownerOrgId }: SlateEvent) => this.orgService.valueChanges(ownerOrgId),
        })
      )
    },
  };

  private eventQuery = <Meta extends EventMeta = unknown>(id: string) => {
    return this.valueChanges<Event<Meta>>(id).pipe(
      joinWith({
        org: ({ ownerOrgId }: Event<Meta>) => this.orgService.valueChanges(ownerOrgId),
        movie: (event: Event<Meta>) => {
          if (isScreening(event)) {
            return event.meta.titleId ? this.movieService.valueChanges(event.meta.titleId) : undefined;
          }
        },
        organizedBy: (event: Event<Meta>) => {
          if (isMeeting(event)) {
            return event.meta.organizerUid ? this.userService.valueChanges(event.meta.organizerUid) : undefined;
          }
        }
      })
    )
  };

  constructor(
    private permissionsService: PermissionsService,
    private orgService: OrganizationService,
    private movieService: MovieService,
    private userService: UserService,
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

  toFirestore(event: Event) {
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

  protected fromFirestore(snapshot: DocumentSnapshot<Event<Timestamp>>): Event<Date> {
    const event = super.fromFirestore(snapshot) as Event<Date>;
    return createCalendarEvent<Date>(event, this.isOwner(event));
  }

  /** Query events based on types */
  queryByType(types: EventTypes[], queryConstraints?: QueryConstraint[]): Observable<Event[]> {
    const queries$ = types.map(type => this.eventQueries[type](queryConstraints));
    return combineLatest(queries$).pipe(
      map((results) => results.flat()),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    );
  }

  /** Query one or many event by id */
  queryDocs<Meta extends EventMeta = unknown>(ids: string[]): Observable<Event<Meta>[]>
  queryDocs<Meta extends EventMeta = unknown>(ids: string): Observable<Event<Meta>>
  queryDocs<Meta extends EventMeta = unknown>(ids: string | string[]): Observable<Event<Meta> | Event<Meta>[]> {
    if (typeof ids === 'string') {
      return this.eventQuery(ids);
    } else if (ids.length === 0) {
      return of([]);
    } else {
      const queries = ids.map(id => this.eventQuery<Meta>(id))
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
