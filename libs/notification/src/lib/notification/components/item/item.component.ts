import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Notification, NotificationService } from '../../+state';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

@Component({
  selector: 'notification-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  @Input() notification: Notification;
  public xs$ = this.breakpointsService.xs;

  constructor(private service: NotificationService, private breakpointsService: BreakpointsService) { }

  ngOnInit(): void {
  }

  public markAsRead(notification: Notification) {
    this.service.readNotification(notification);
  }
}
