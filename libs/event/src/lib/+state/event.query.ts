import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { EventStore, EventState } from './event.store';

@Injectable({ providedIn: 'root' })
export class EventQuery extends QueryEntity<EventState> {

  constructor(protected store: EventStore) {
    super(store);
  }
}
