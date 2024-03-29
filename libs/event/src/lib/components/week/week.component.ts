import { Component, Input, Inject, ChangeDetectorRef, ChangeDetectionStrategy, ContentChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { trigger, transition, style, animate } from '@angular/animations';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

import { CalendarEvent, CalendarEventTimesChangedEvent } from 'angular-calendar';
import { WeekViewHourSegment } from 'calendar-utils';
import { addDays, addMinutes, endOfWeek, startOfWeek } from 'date-fns';

import { EventSmallDirective, EventLargeDirective } from '../event.directive';
import { EventService } from '../../service';
import { EventTypes, createEvent } from '@blockframes/model';
import { EventCreateComponent } from '../../form/create/create.component';
import { fromEvent } from 'rxjs';
import { map, finalize, takeUntil, distinctUntilChanged } from 'rxjs/operators';

import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/service';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

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
  loading = false;
  @Input() viewDate: Date = new Date();
  @Input() eventTypes: EventTypes[] = ['screening', 'meeting', 'slate'];
  @Input()
  set events(events: CalendarEvent<unknown>[]) {
    this.loading = !events;
    this.baseEvents = events || [];
    this.refresh(events || []);
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
    private orgService: OrganizationService,
    private service: EventService,
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) { }

  startDragToCreate(
    segment: WeekViewHourSegment,
    segmentElement: HTMLElement
  ) {
    if (!this.editable) {
      return;
    }
    const localEvent: CalendarEvent = createEvent({
      id: this.service.createId(),
      ownerOrgId: this.orgService.org.id,
      title: 'New event',
      start: segment.date,
      end: addMinutes(segment.date, 30),
      type: 'local'
    });
    this.localEvents.push(localEvent);
    const segmentPosition = segmentElement.getBoundingClientRect();
    const startOfView = startOfWeek(this.viewDate, { weekStartsOn: 0 });
    const endOfView = endOfWeek(this.viewDate, { weekStartsOn: 0 });

    fromEvent(this.document, 'mousemove')
      .pipe(
        finalize(() => this.createEvent(localEvent)),
        takeUntil(fromEvent(this.document, 'mouseup')),
        map((event: MouseEvent) => {
          const min = ceilToNearest(event.clientY - segmentPosition.top, 30);
          const days = floorToNearest(event.clientX - segmentPosition.left, segmentPosition.width) / segmentPosition.width;
          event.preventDefault();
          return addDays(addMinutes(segment.date, min), days);
        }),
        distinctUntilChanged((a, b) => a.getTime() === b.getTime())
      )
      .subscribe(targetDate => {
        if (targetDate > startOfView && startOfView < endOfView) {
          if (targetDate > segment.date) {
            localEvent.end = targetDate;
          } else {
            localEvent.end = segment.date;
            localEvent.start = targetDate;
          }
        }
        this.refresh(this.localEvents);
      });
  }

  private refresh(newEvents: CalendarEvent[]) {
    this.localEvents = [...newEvents];
    this.cdr.markForCheck();
  }

  /** Open a create dialog and redirect if needed */
  private createEvent(calEvent: CalendarEvent) {
    this.dialog.open(EventCreateComponent, {
      data: createModalData({ event: { ...calEvent, type: '' }, types: this.eventTypes }),
      autoFocus: false
    }).afterClosed()
      .subscribe(async ({ event } = {}) => {
        if (event) {
          this.loading = true;
          this.cdr.markForCheck();
          await this.service.add(event);
          await this.router.navigate([event.id, 'edit'], { relativeTo: this.route });
        } else {
          this.refresh(this.baseEvents);
        }
      });
  }


  updateEvent(timeChange: CalendarEventTimesChangedEvent) {
    if (timeChange.event['isOwner']) {
      const event = { id: timeChange.event.id as string, start: timeChange.newStart, end: timeChange.newEnd };
      this.service.update(event);
    }
  }

}
