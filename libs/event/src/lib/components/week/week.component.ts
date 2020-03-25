import { Component, Input, Inject, ChangeDetectorRef, ChangeDetectionStrategy, ContentChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { trigger, transition, style, animate } from '@angular/animations';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { WeekViewHourSegment } from 'calendar-utils';
import { addDays, addMinutes, endOfWeek, startOfWeek } from 'date-fns';

import { EventSmallDirective, EventLargeDirective } from '../event.directive';
import { EventService } from '../../+state/event.service';
import { createEvent } from '../../+state/event.model';
import { EventTypes } from '../../+state/event.firestore';
import { EventCreateComponent } from '../../form/create/create.component';
import { fromEvent } from 'rxjs';
import { map, finalize, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { AuthQuery } from '@blockframes/auth/+state/auth.query';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('fadeIn', [
      transition('void => true', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('200ms cubic-bezier(0.16, 1, 0.3, 1)')
      ]),
    ]),
    trigger('fadeOut', [
      transition(':leave', [
        animate('200ms cubic-bezier(0.7, 0, 0.84, 0)', style({ opacity: 0, transform: 'translateY(20px)' }))
      ]),
    ])
  ]
})
export class CalendarWeekComponent {
  private _editable: boolean;
  baseEvents: CalendarEvent[];
  localEvents: CalendarEvent[];
  @Input() viewDate: Date = new Date();
  @Input() eventType: EventTypes = 'standard';
  @Input()
  set events(events: CalendarEvent<any>[]) {
    this.baseEvents = events;
    this.refresh(events);
  }

  @Input()
  set editable(editable: boolean) {
    this._editable = coerceBooleanProperty(editable);
  }
  get editable(): boolean {
    return this._editable;
  }


  @ContentChild(EventSmallDirective) smallEvent: EventSmallDirective;
  @ContentChild(EventLargeDirective) largeEvent: EventLargeDirective;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authQuery: AuthQuery,
    private service: EventService,
    private bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {}

  startDragToCreate(
    segment: WeekViewHourSegment,
    mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ) {
    if (!this.editable) {
      return;
    }
    const lcoalEvent: CalendarEvent = createEvent({
      id: this.service['db'].createId(),
      ownerId: this.authQuery.userId,
      title: 'New event',
      start: segment.date,
      end: addMinutes(segment.date, 30),
      type: 'local'
    });
    this.localEvents.push(lcoalEvent);
    const segmentPosition = segmentElement.getBoundingClientRect();
    const startOfView = startOfWeek(this.viewDate, { weekStartsOn: 0 });
    const endOfView = endOfWeek(this.viewDate, { weekStartsOn: 0 });

    fromEvent(this.document, 'mousemove')
      .pipe(
        finalize(() => this.createEvent(lcoalEvent)),
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
            lcoalEvent.end = targetDate;
          } else {
            lcoalEvent.end = segment.date;
            lcoalEvent.start = targetDate;
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
    this.dialog.open(EventCreateComponent, { data }).afterClosed().subscribe(async event => {
      if (event) {
        event.type = this.eventType;
        this.service.add(event);
      } else {
        this.refresh(this.baseEvents);
      }
    });
  }


  updateEvent(timeChange: CalendarEventTimesChangedEvent) {
    if (this.authQuery.userId === timeChange.event['userId']) {
      const event = { id: timeChange.event.id as string, start: timeChange.newStart, end: timeChange.newEnd };
      this.service.update(event);
    }
  }

}
