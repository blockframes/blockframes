import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { EventService } from '@blockframes/event/+state';
import { Subscription } from 'rxjs';
import { switchMap, pluck } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { slideUpList } from '@blockframes/utils/animations/fade';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Event } from '@blockframes/event/+state';

@Component({
  selector: 'event-analytics-page',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  animations: [slideUpList('h2, mat-card')],// @TODO #5895 check
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  event: Event;

  constructor(
    private service: EventService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit(): void {
    this.dynTitle.setPageTitle('Add an event', 'Event Attendance');
    const eventId$ = this.route.params.pipe(pluck('eventId'));

    this.sub = eventId$.pipe(
      switchMap((eventId: string) => this.service.valueChanges(eventId))
    ).subscribe(event => {
      this.event = event;
      this.cdr.markForCheck();
    });
  }

  // Will be used to show event statistics only if event started
  isEventStarted() {
    const start = this.event.start;
    return start.getTime() < Date.now();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
