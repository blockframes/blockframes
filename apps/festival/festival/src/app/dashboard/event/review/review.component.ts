import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Event } from '@blockframes/event/+state';
import { EventService } from '@blockframes/event/+state/event.service';
import { Observable } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'festival-event-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventReviewComponent implements OnInit {
  event$: Observable<Event>;
  eventId$: Observable<string>;

  constructor(
    private service: EventService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.eventId$ = this.route.params.pipe(pluck('eventId'));

    this.event$ = this.eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    );
  }
}
