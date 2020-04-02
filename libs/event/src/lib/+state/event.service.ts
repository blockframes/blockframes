import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, syncQuery, Query } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { Event, ScreeningEvent } from './event.model';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { Observable } from 'rxjs';

const screeningsQuery = (queryFn?: QueryFn): Query<ScreeningEvent> => ({
  path: 'events',
  queryFn,
  movie: (event: ScreeningEvent) => ({ path: `movies/${event.meta.titleId}`})
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {

  constructor(store: EventStore) {
    super(store);
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

  syncScreenings(queryFn?: QueryFn): Observable<ScreeningEvent[]> {
    return syncQuery.call(this, screeningsQuery(queryFn));
  }
}
