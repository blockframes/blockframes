import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Notification, NotificationService } from '../../+state';

@Component({
  selector: 'notification-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemComponent implements OnInit {

  @Input() notification: Notification;
  constructor(private service: NotificationService) { }

  ngOnInit(): void {
  }

  public markAsRead(notification: Notification) {
    this.service.readNotification(notification);
  }
}
