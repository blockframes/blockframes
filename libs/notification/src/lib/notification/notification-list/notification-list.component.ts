import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NotificationQuery, Notification } from '../+state';
import { Observable } from 'rxjs';
import { DateGroup } from '@blockframes/utils/helpers';
import { ThemeService } from '@blockframes/ui/theme';

@Component({
  selector: 'notification-list',
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationListComponent implements OnInit {
  public notificationsByDate$: Observable<DateGroup<Notification[]>>;
  public theme$: Observable<string>;

  public today: Date = new Date();
  public yesterday: Date = new Date();

  constructor(private query: NotificationQuery, private themeService: ThemeService) {}

  ngOnInit() {
    this.yesterday.setDate(this.today.getDate() - 1);
    this.theme$ = this.themeService.theme$;

    this.notificationsByDate$ = this.query.groupNotificationsByDate();
  }
}
