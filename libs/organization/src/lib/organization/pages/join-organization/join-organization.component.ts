import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'join-organization',
  templateUrl: './join-organization.component.html',
  styleUrls: ['./join-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinOrganizationComponent implements OnInit {
  public invitations: Invitation[];
  public org: Organization;
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public user = this.authQuery.user;
  public sub: Subscription;

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
    const organizations = await this.service.getValue(ref => ref.where('id', '==', this.invitations[0].toOrg.id));
    this.org = organizations[0];
    console.log(this.invitations)
    console.log(this.org)
  }

}
