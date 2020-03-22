import { Component, Input, Inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { WeekViewHourSegment } from 'calendar-utils';
import { addDays, addMinutes, endOfWeek, startOfWeek } from 'date-fns';
import { EventService } from '../../+state/event.service';
import { EventCreateComponent } from '../../form/create/create.component';

import { fromEvent } from 'rxjs';
import { map, finalize, takeUntil, distinctUntilChanged } from 'rxjs/operators';
import { AuthQuery } from '@blockframes/auth';

function floorToNearest(amount: number, precision: number) {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number) {
  return Math.ceil(amount / precision) * precision;
}

@Component({
  selector: 'cal-week',
  templateUrl: './week.component.html',
  styleUrls: ['./week.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CalendarWeekComponent {
  baseEvents: CalendarEvent[];
  localEvents: CalendarEvent[];
  @Input() viewDate: Date = new Date();
  @Input()
  set events(events: CalendarEvent<any>[]) {
    this.baseEvents = events;
    this.refresh(events);
  }

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authQuery: AuthQuery,
    private service: EventService,
    private bottomSheet: MatBottomSheet,
    private cdr: ChangeDetectorRef,
  ) {}

  startDragToCreate(
    segment: WeekViewHourSegment,
    mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ) {
    const tmpEvent: CalendarEvent = {
      id: this.service['db'].createId(),
      title: 'New event',
      start: segment.date,
      end: addMinutes(segment.date, 30),
      meta: { tmp: true } // Will be removed by the form
    };
    this.localEvents.push(tmpEvent);
    const segmentPosition = segmentElement.getBoundingClientRect();
    const startOfView = startOfWeek(this.viewDate, { weekStartsOn: 0 });
    const endOfView = endOfWeek(this.viewDate, { weekStartsOn: 0 });

    fromEvent(this.document, 'mousemove')
      .pipe(
        finalize(() => this.createEvent(tmpEvent)),
        takeUntil(fromEvent(this.document, 'mouseup')),
        map((mouseMoveEvent: MouseEvent) => {
          const min = ceilToNearest(mouseMoveEvent.clientY - segmentPosition.top, 30);
          const days = floorToNearest(mouseMoveEvent.clientX - segmentPosition.left, segmentPosition.width) / segmentPosition.width;
          return addDays(addMinutes(segment.date, min), days);
        }),
        distinctUntilChanged((a, b) => a.getTime() === b.getTime())
      )
      .subscribe(targetDate => {
        if (targetDate > startOfView && startOfView < endOfView) {
          if (targetDate > segment.date) {
            tmpEvent.end = targetDate;
          } else {
            tmpEvent.end = segment.date;
            tmpEvent.start = targetDate;
          }
        }
        this.refresh(this.localEvents);
      });
  }

  private refresh(newEvents: CalendarEvent[]) {
    this.localEvents = [...newEvents];
    this.cdr.markForCheck();
  }

  private createEvent(data: CalendarEvent) {
    this.bottomSheet.open(EventCreateComponent, { data }).afterDismissed().subscribe(event => {
      event
        ? this.service.add(event)
        : this.refresh(this.baseEvents);
    });
  }

  updateEvent(timeChange: CalendarEventTimesChangedEvent) {
    if (this.authQuery.userId === timeChange.event['userId']) {
      const event = { id: timeChange.event.id, start: timeChange.newStart, end: timeChange.newEnd };
      this.service.update(event);
    }
  }
}
