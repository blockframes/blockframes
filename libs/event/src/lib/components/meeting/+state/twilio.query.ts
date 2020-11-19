import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Attendee, LocalAttendee } from './twilio.model';
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

  // TODO This is for debug purpose only, this should be deleted before merging
  // TODO This functions just take all attendees and return it n times
  selectMultiple(n: number) {
    return this.selectAll().pipe(
      map(attendees => {
        const multiplied: Attendee[] = [];
        attendees.forEach(attendee => {
          for (let i = 0 ; i < n ; i++) {
            multiplied.push(attendee);
          }
        });
        return multiplied;
      }),
    );
  }
}
