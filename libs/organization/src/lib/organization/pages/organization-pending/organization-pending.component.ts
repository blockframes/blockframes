import { ChangeDetectionStrategy, Component, Inject, Optional } from '@angular/core';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { App } from '@blockframes/utils/apps';
import { OrganizationService } from '@blockframes/organization/+state';
import { filter, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { User } from '@blockframes/user/+state';
import { AuthService } from '@blockframes/auth/+state';
import { APP } from '@blockframes/utils/routes/utils';
import { Organization } from '@blockframes/model';

const queryFn = (uid: string) => ref => ref.where('mode', '==', 'request')
  .where('type', '==', 'joinOrganization')
  .where('fromUser.uid', '==', uid);

@Component({
  selector: 'organization-pending',
  templateUrl: './organization-pending.component.html',
  styleUrls: ['./organization-pending.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationPendingComponent {
  public invitations: Invitation[];
  public org$: Observable<Organization>;
  public orgActive$ = this.authService.profile$.pipe(
    filter(user => !!user),
    switchMap(user => this.getOrgId(user)),
    filter(orgId => !!orgId),
    switchMap(orgId => this.service.valueChanges(orgId))
  );

  constructor(
    private service: OrganizationService,
    private invitationService: InvitationService,
    private authService: AuthService,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App
  ) { }

  private async getOrgId(user: User) {
    if (user.orgId) return user.orgId;
    const invitations = await this.invitationService.getValue(queryFn(user.uid));
    return invitations[0]?.toOrg.id;
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  public logout() {
    this.authService.signOut();
  }
}
