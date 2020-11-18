import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { LocalAttendee } from './twilio.model';
import { TwilioStore, TwilioState } from './twilio.store';

@Injectable({ providedIn: 'root' })
export class TwilioQuery extends QueryEntity<TwilioState> {

  constructor(protected store: TwilioStore) {
    super(store);
  }

  get localAttendee() {
    return this.getEntity('local') as LocalAttendee;
  }

  selectLocal() {
    return this.selectEntity('local') as Observable<LocalAttendee>;
  }
}
