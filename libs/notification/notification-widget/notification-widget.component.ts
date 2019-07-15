import { Component, ChangeDetectionStrategy, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { User, AuthQuery } from "@blockframes/auth";
import { NotificationQuery } from "../+state";

@Component({
  selector: 'notification-widget',
  templateUrl: './notification-widget.component.html',
  styleUrls: ['./notification-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationWidgetComponent implements OnInit {

  public user$: Observable<User>;
  public notificationsCount$: Observable<number>;

  constructor(
    private auth: AuthQuery,
    private notificationQuery: NotificationQuery,
  ){}

  ngOnInit(){
    this.user$ = this.auth.user$;
    this.notificationsCount$ = this.notificationQuery.selectCount(entity => !entity.isRead);
  }
}
