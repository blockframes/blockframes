import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Organization, OrganizationService } from '@blockframes/organization/+state';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'join-organization',
  templateUrl: './join-organization.component.html',
  styleUrls: ['./join-organization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JoinOrganizationComponent implements OnInit {
  public invitations: Invitation[];
  public org$: Observable<Organization>;
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public user = this.authQuery.user;

  constructor(
    private service: OrganizationService,
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
  ) { }

  async ngOnInit() {
    const uid = this.authQuery.userId;
    this.org$ = this.invitationService.valueChanges(ref => ref.where('mode', '==', 'request')
      .where('type', '==', 'joinOrganization')
      .where('fromUser.uid', '==', uid)).pipe(
        switchMap(invitations => this.service.valueChanges(invitations[0].toOrg.id))
      )
  }

}
