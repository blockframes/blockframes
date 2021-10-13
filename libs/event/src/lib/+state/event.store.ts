import { Injectable } from '@angular/core';
import { Event } from './event.model';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';

export interface EventState extends EntityState<Event>, ActiveState<string> {
  localSessionStart: number | undefined;
}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'event' })
export class EventStore extends EntityStore<EventState> {
  analytics = new EntityStore<EventState>(null, { name: 'eventAnalytics', idKey: 'eventId' });

  constructor() {
    super({ localSessionStart: undefined });
  }
}

