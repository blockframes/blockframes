import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationQuery, InvitationStore } from '../../invitation/+state';
import { map } from 'rxjs/operators';
import { User } from '@blockframes/auth/+state/auth.store';
import { NotificationQuery } from '../+state/notification.query';

@Component({
  selector: 'overlay-notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  providers: [InvitationQuery, InvitationStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationWidgetComponent implements OnInit {
  @Input() page = 'activity';
  public user$: Observable<User>;
  public notificationCount$: Observable<number>;
  public invitationCount$: Observable<number>;
  public notifications$ = this.notificationQuery.groupNotificationsByDate();

  constructor(
    private authQuery: AuthQuery,
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
  ) { }

  ngOnInit() {
    this.user$ = this.authQuery.user$;
    this.notificationCount$ = this.notificationQuery.selectCount(notification => !notification.isRead);
    this.invitationCount$ = this.invitationQuery.selectCount(invitation => invitation.status === 'pending');
  }

  public get totalCount$() {
    return combineLatest([this.invitationCount$, this.notificationCount$]).pipe(
      map(counts => counts[0] + counts[1])
    );
  }
}
