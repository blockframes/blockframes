import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state/auth.service';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { NotificationService } from '@blockframes/notification/+state/notification.service';
import { OrganizationService } from '@blockframes/organization/+state';

@Component({
  selector: 'marketplace-aside',
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AsideComponent {
  public org$ = this.orgService.currentOrg$;
  public notificationCount$ = this.notificationService.myNotificationsCount$;
  public invitationCount$ = this.invitationService.invitationCount();

  constructor(
    private authService: AuthService,
    private invitationService: InvitationService,
    private notificationService: NotificationService,
    private orgService: OrganizationService
  ) { }

  public async logout() {
    await this.authService.signOut();
  }
}
