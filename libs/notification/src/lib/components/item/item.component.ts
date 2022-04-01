import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { NotificationService } from '../../+state';
import { Notification } from '@blockframes/shared/model';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { isSafari } from '@blockframes/utils/browser/utils';

@Component({
  selector: 'notification-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemComponent {
  @Input() notification: Notification;
  public xs$ = this.breakpointsService.xs;

  constructor(private service: NotificationService, private breakpointsService: BreakpointsService) {}

  public markAsRead(notification: Notification) {
    this.service.readNotification(notification);
  }

  get targetLink() {
    return isSafari() ? '_blank' : '_self';
  }
}
