import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService, syncQuery, Query } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { Event, ScreeningEvent } from './event.model';
import { QueryFn } from '@angular/fire/firestore/interfaces';
import { Observable } from 'rxjs';

const screeningQuery = (queryFn: QueryFn): Query<ScreeningEvent> => ({
  path: 'events',
  queryFn,
  titles: (event: ScreeningEvent) => event.meta.titleIds.map(id => ({ path: `movies/${id}`}))
});

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {

  constructor(store: EventStore) {
    super(store);
  }

  formatToFirestore(event: Event) {
    const e = { ...event };
    delete e.draggable;
    delete e.resizable;
    delete e.color;
    delete e.cssClass;
    return e;
  }

  syncScreening(queryFn: QueryFn): Observable<ScreeningEvent[]> {
    return syncQuery.call(this, screeningQuery(queryFn));
  }
}
