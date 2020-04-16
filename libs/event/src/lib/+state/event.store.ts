import { Injectable } from '@angular/core';
import { Event, createCalendarEvent } from './event.model';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { AuthQuery } from '@blockframes/auth/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';

export interface EventState extends EntityState<Event>, ActiveState<string>  {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'event' })
export class EventStore extends EntityStore<EventState> {

  constructor(private authQuery: AuthQuery, private orgQuery: OrganizationQuery) {
    super();
  }
}

