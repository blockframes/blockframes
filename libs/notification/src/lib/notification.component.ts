import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { map } from 'rxjs/operators';
import { NotificationQuery } from './+state/notification.query';
import { NotificationService } from './+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Subscription } from 'rxjs';


@Component({
  selector: 'notification-view',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationComponent implements OnInit, OnDestroy {

  public hasNotifications$ = this.query.selectCount().pipe(map(count => !!count))
  public notifications$ = this.query.selectAll();
  public isDataLoaded = false;
  private sub: Subscription;

  constructor(
    private query: NotificationQuery,
    private service: NotificationService,
    private dynTitle: DynamicTitleService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Activity Feed');

    this.sub = this.notifications$.subscribe(_ => {
      this.isDataLoaded = true;
      this.cdr.markForCheck();
    });

  }

  markAll() {
    for (const notification of this.query.getAll()) {
      this.service.readNotification(notification);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
