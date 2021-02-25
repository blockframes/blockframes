import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Organization, OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'join-organization',
  templateUrl: './join-organization.component.html',
  styleUrls: ['./join-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinOrganizationComponent implements OnInit {
  public invitations: Invitation[];
  public org: Organization[];
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public user = this.authQuery.user;
  public sub: Subscription;
  // Checkbox
  public profileData = false;
  public orgData = false;
  public emailValidate = false;
  public orgApproval = false;

  constructor(
    private service: OrganizationService,
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
  ) { }

  async ngOnInit() {
    const uid = this.authQuery.userId;
    this.invitations = await this.invitationService.getValue(ref => ref.where('mode', '==', 'request')
      .where('type', '==', 'joinOrganization')
      .where('fromUser.uid', '==', uid));

      //? Return empty aray ?!?!?!?!?!?!?!
    this.org = await this.service.getValue(ref => ref.where('id', '==', this.invitations[0].toOrg.id));

    // Filled checkbox
    if (!!this.user.firstName && !this.user.lastName && !!this.user.email) this.profileData = true;
    // if (!!this.org.denomination.full && (this.org.appAccess[this.app].marketplace || this.org.appAccess[this.app].dashboard)) {
    //   this.orgData = true;
    // }
  }

}
