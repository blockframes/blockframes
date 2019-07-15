import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { User, AuthQuery } from "@blockframes/auth";
import { NotificationQuery } from "../notification/+state";
import { InvitationQuery } from "../invitation/+state";

@Component({
  selector: 'notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationWidgetComponent implements OnInit {

  public user$: Observable<User>;
  public notificationsCount$: Observable<number>;
  public invitationsCount$: Observable<number>;

  constructor(
    private auth: AuthQuery,
    private notificationQuery: NotificationQuery,
    private invitationQuery: InvitationQuery,
  ){}

  ngOnInit(){
    this.user$ = this.auth.user$;
    this.notificationsCount$ = this.notificationQuery.selectCount(entity => !entity.isRead);
    // TODO: sum the notificationsCount and the invitationsCount
    this.invitationsCount$ = this.invitationQuery.selectCount(entity => entity.isAccepted === 'pending');
  }
}
