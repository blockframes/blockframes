
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

import { UserService, User } from '@blockframes/user/+state';
import { Event, EventQuery } from '@blockframes/event/+state';
import { Meeting } from '@blockframes/event/+state/event.firestore';

@Component({
  selector: 'event-meeting-session-ended',
  templateUrl: './meeting-ended.component.html',
  styleUrls: ['./meeting-ended.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingEndedComponent implements OnInit {

  duration: number;
  event$: Observable<Event<Meeting>>;
  attendees$: Observable<User[]>;

  constructor(
    private eventQuery: EventQuery,
    private userService: UserService,
  ) { }

  ngOnInit() {
    const { localSessionStart } = this.eventQuery.getValue();
    this.duration = Date.now() - localSessionStart;
    this.event$ = this.eventQuery.selectActive<Event<Meeting>>() as Observable<Event<Meeting>>;
    this.attendees$ = this.event$.pipe(
      filter(event => Object.keys(event.meta.attendees).length > 0),
      switchMap(event => Promise.all(
        Object.keys(event.meta.attendees).map(uid => this.userService.getUser(uid))
      )),
    );
  }

}
