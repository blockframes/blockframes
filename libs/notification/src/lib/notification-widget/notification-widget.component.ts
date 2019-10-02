import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User, AuthQuery } from '@blockframes/auth';
import { NotificationQuery } from '../notification/+state';
import { InvitationQuery, InvitationStore } from '../invitation/+state';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationWidgetComponent implements OnInit, OnDestroy {
  public user$: Observable<User>;
  public notifCount: number;
  public invitCount: number;
  private destroyed$ = new Subject();

  constructor(
    private auth: AuthQuery,
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery
  ) {}

  ngOnInit() {
    this.user$ = this.auth.user$;
    this.notificationQuery
      .selectCount(entity => !entity.isRead)
      .pipe(takeUntil(this.destroyed$))
      .subscribe(count => (this.notifCount = count));
    this.invitationQuery
      .selectCount(entity => entity.state === 'pending')
      .pipe(takeUntil(this.destroyed$))
      .subscribe(count => (this.invitCount = count));
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.unsubscribe();
  }
}
