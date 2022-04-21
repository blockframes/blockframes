import { ChangeDetectionStrategy, Component } from "@angular/core";
import { InvitationService } from "@blockframes/invitation/+state/invitation.service";
import { NotificationService } from "@blockframes/notification/+state/notification.service";

@Component({
  selector: 'auth-sidenav-widget',
  templateUrl: './sidenav-widget.component.html',
  styleUrls: ['./sidenav-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavWidgetComponent {
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.invitationCount();

  constructor(
    private invitationService: InvitationService,
    private notificationService: NotificationService
  ) { }

}