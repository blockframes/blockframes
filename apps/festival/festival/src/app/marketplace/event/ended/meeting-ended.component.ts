
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { Event, EventQuery } from '@blockframes/event/+state';
import { Meeting, MeetingAttendee } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: 'event-meeting-session-ended',
  templateUrl: './meeting-ended.component.html',
  styleUrls: ['./meeting-ended.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingEndedComponent implements OnInit {

  duration: number;
  event$: Observable<Event<Meeting>>;
  attendees$: Observable<MeetingAttendee[]>;

  constructor(
    private eventQuery: EventQuery,
  ) { }

  ngOnInit() {
    const { localSessionStart } = this.eventQuery.getValue();
    this.duration = Date.now() - localSessionStart;
    this.event$ = this.eventQuery.selectActive<Event<Meeting>>() as Observable<Event<Meeting>>;
    this.attendees$ = this.event$.pipe(
      filter(event => Object.keys(event.meta.attendees).length > 0),
      map(event => Object.values(event.meta.attendees)),
    );
  }

}
