
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, pluck, switchMap } from 'rxjs/operators';
import { Event, EventService } from '@blockframes/event/+state';
import { Meeting, MeetingAttendee } from '@blockframes/event/+state/event.firestore';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'festival-event-meeting-session-ended',
  templateUrl: './meeting-ended.component.html',
  styleUrls: ['./meeting-ended.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingEndedComponent implements OnInit {

  duration: number;
  event$: Observable<Event<Meeting>>;
  attendees$: Observable<MeetingAttendee[]>;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    const localSessionStart = this.eventService.getLocalSession();
    this.duration = Date.now() - localSessionStart;
    this.event$ = this.route.params.pipe(
      pluck('eventId'),
      switchMap((eventId: string) => this.eventService.valueChanges(eventId) as Observable<Event<Meeting>>),
    );
    this.attendees$ = this.event$.pipe(
      filter(event => Object.keys(event.meta.attendees).length > 0),
      map(event => Object.values(event.meta.attendees)),
    );
  }

}
