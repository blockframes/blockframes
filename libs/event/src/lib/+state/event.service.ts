import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { EventState, EventStore } from './event.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'events' })
export class EventService extends CollectionService<EventState> {

  constructor(store: EventStore) {
    super(store);
  }
}
