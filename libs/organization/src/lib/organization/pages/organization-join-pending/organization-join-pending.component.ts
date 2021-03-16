import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { OrganizationService } from '@blockframes/organization/+state';
import { map, switchMap } from 'rxjs/operators';

const queryFn = (uid: string) => ref => ref.where('mode', '==', 'request')
  .where('type', '==', 'joinOrganization')
  .where('fromUser.uid', '==', uid);

@Component({
  selector: 'organization-join-pending',
  templateUrl: './organization-join-pending.component.html',
  styleUrls: ['./organization-join-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationJoinPendingComponent {
  public invitations: Invitation[];
  public org$ = this.invitationService.valueChanges(queryFn(this.authQuery.userId)).pipe(
    map(invitations => invitations[0].toOrg.id),
    switchMap(orgId => this.service.valueChanges(orgId))
  );
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public user = this.authQuery.user;

  constructor(
    private service: OrganizationService,
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
  ) { }
}
