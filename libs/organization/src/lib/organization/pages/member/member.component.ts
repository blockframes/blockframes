import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { OrganizationService } from '@blockframes/organization/+state';
import { OrganizationMember, Organization, Invitation } from '@blockframes/model';
import { buildJoinOrgQuery } from '@blockframes/invitation/invitation-utils';
import { UserRole } from 'libs/model/src/lib/permissions';
import { PermissionsService } from '@blockframes/permissions/+state';

@Component({
  selector: 'member-edit',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit {
  public orgName: string = this.orgService.org.denomination.full;
  public org: Organization = this.orgService.org;

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]>;

  public isAdmin$: Observable<boolean>;
  public isSuperAdmin$: Observable<boolean>;

  constructor(
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private permissionService: PermissionsService,
    private orgService: OrganizationService,
  ) { }

  ngOnInit() {
    this.members$ = this.orgService.membersWithRole$;

    this.isAdmin$ = this.permissionService.isAdmin$;
    this.isSuperAdmin$ = this.permissionService.isSuperAdmin$;

    if (this.permissionService.isUserAdmin()) {
      const queryFn1 = buildJoinOrgQuery(this.org.id, 'invitation');
      const queryFn2 = buildJoinOrgQuery(this.org.id, 'request');

      this.invitationsFromOrganization$ = this.invitationService.valueChanges(queryFn1);
      this.invitationsToJoinOrganization$ = this.invitationService.valueChanges(queryFn2);
    }
  }

  public acceptInvitation(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  public declineInvitation(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
  }

  public deleteInvitation(invitation: Invitation) {
    this.invitationService.remove(invitation.id);
  }

  /** Update user role. */
  public async updateRole(uid: string, role: UserRole) {
    const message = await this.permissionService.updateMemberRole(uid, role);
    return this.snackBar.open(message, 'close', { duration: 2000 });
  }

  public async removeMember(uid: string) {
    try {
      await this.orgService.removeMember(uid);
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
