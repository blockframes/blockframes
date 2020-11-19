import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Attendee } from './twilio.model';

export interface TwilioState extends EntityState<Attendee, string>, ActiveState<string>  {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'twilio', deepFreezeFn: state => state })
export class TwilioStore extends EntityStore<TwilioState> {

  constructor() {
    super();
  }
}

