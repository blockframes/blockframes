import { Component, Input, ViewChild, TemplateRef, AfterViewInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { Notification, NotificationService } from '../../+state';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { isSafari } from '@blockframes/utils/browser/utils';

@Component({
  selector: 'notification-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements AfterViewInit {
  @ViewChild('requestToAttendEventSent') requestToAttendEventSent?: TemplateRef<unknown>;
  @ViewChild('eventIsAboutToStart') eventIsAboutToStart?: TemplateRef<unknown>;
  @ViewChild('oneDayReminder') oneDayReminder?: TemplateRef<unknown>;
  @ViewChild('invitationToAttendEventUpdated') invitationToAttendEventUpdated?: TemplateRef<unknown>;
  @ViewChild('requestToAttendEventUpdated') requestToAttendEventUpdated?: TemplateRef<unknown>;
  @ViewChild('movieSubmitted') movieSubmitted?: TemplateRef<unknown>;

  @Input() notification: Notification;
  public xs$ = this.breakpointsService.xs;

  public templates: Record<string, TemplateRef<unknown>> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private service: NotificationService,
    private breakpointsService: BreakpointsService
  ) { }

  ngAfterViewInit() {
    this.templates = {
      requestToAttendEventSent: this.requestToAttendEventSent,
      eventIsAboutToStart: this.eventIsAboutToStart,
      oneDayReminder: this.oneDayReminder,
      invitationToAttendEventUpdated: this.invitationToAttendEventUpdated,
      requestToAttendEventUpdated: this.requestToAttendEventUpdated,
      movieSubmitted: this.movieSubmitted,
    }
    this.cdr.markForCheck()
  }

  public markAsRead(notification: Notification) {
    this.service.readNotification(notification);
  }

  get targetLink() {
    return isSafari() ? '_blank' : '_self';
  }
}
