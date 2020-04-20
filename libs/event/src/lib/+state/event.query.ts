import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { EventStore, EventState } from './event.store';
import { EventsAnalytics } from './event.model';

@Injectable({ providedIn: 'root' })
export class EventQuery extends QueryEntity<EventState> {
  analytics = new QueryEntity<EventState, EventsAnalytics>(this.store.analytics);

  constructor(protected store: EventStore) {
    super(store);
  }
}
