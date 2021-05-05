import { ChangeDetectionStrategy, Component, OnInit, Optional } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { getCurrentApp, appName } from '@blockframes/utils/apps';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { Organization, OrganizationQuery, OrganizationService } from '@blockframes/organization/+state';
import { map, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';

const queryFn = (uid: string) => ref => ref.where('mode', '==', 'request')
  .where('type', '==', 'joinOrganization')
  .where('fromUser.uid', '==', uid);

@Component({
  selector: 'organization-pending',
  templateUrl: './organization-pending.component.html',
  styleUrls: ['./organization-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationPendingComponent implements OnInit {
  public invitations: Invitation[];
  public org$: Observable<Organization>;
  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  public user = this.authQuery.user;
  public orgActive = this.query.getActive();

  constructor(
    private service: OrganizationService,
    private invitationService: InvitationService,
    private authQuery: AuthQuery,
    private routerQuery: RouterQuery,
    private query: OrganizationQuery,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    if(!this.orgActive) {
      this.org$ = this.invitationService.valueChanges(queryFn(this.authQuery.userId)).pipe(
        map(invitations => invitations[0].toOrg.id),
        switchMap(orgId => this.service.valueChanges(orgId))
      )
    }
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
