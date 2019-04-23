import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'blockframes-notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {

  public notifications = [
    {
      id: '1',
      content: 'This is my first notification',
      app: 'Delivery'
    },
    {
      id: '2',
      content: 'This is my second notification',
      app: 'Delivery'
    },
    {
      id: '3',
      content: 'This is my third notification',
      app: 'Delivery'
    }
  ]

  constructor() { }

  ngOnInit() {
  }

}
