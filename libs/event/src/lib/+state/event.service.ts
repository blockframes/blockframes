import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';
import { Event } from './event.model';

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
    return e;
  }
}
