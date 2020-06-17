import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { OrganizationQuery } from '../../+state/organization.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionsQuery, UserRole, PermissionsService } from '../../../permissions/+state';
import { UserQuery } from '@blockframes/user/+state/user.query';
import { InvitationService } from '@blockframes/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/invitation/+state/invitation.model';
import { OrganizationMember } from '@blockframes/user/+state/user.model';
import { OrganizationService, Organization } from '@blockframes/organization/+state';
import { buildJoinOrgQuery } from '@blockframes/invitation/invitation-utils';

@Component({
  selector: 'member-edit',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit {
  public orgName: string = this.query.getActive().denomination.full;
  public org: Organization = this.query.getActive();

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]>;

  public isAdmin$: Observable<boolean>;
  public isSuperAdmin$: Observable<boolean>;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private permissionQuery: PermissionsQuery,
    private permissionService: PermissionsService,
    private userQuery: UserQuery,
    private orgService: OrganizationService,
  ) { }

  ngOnInit() {
    this.members$ = this.userQuery.membersWithRole$;

    this.isAdmin$ = this.permissionQuery.isAdmin$;
    this.isSuperAdmin$ = this.permissionQuery.isSuperAdmin$;

    if (this.permissionQuery.isUserAdmin()) {
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

  /** Ensures that there is always at least one super Admin in the organization. */
  public hasLastSuperAdmin(uid: string, role: UserRole) {
    if (role !== 'superAdmin' && this.permissionQuery.isUserSuperAdmin(uid)) {
      const superAdminNumber = this.permissionQuery.superAdminCount;
      return superAdminNumber > 1 ? true : false;
    } else {
      return true;
    }
  }

  /** Update user role. */
  public async updateRole(uid: string, role: UserRole) {
    const message = await this.permissionService.updateMemberRole(uid, role);
    return this.snackBar.open(message, 'close', { duration: 2000 });
  }

  public removeMember(uid: string) {
    try {
      this.orgService.removeMember(uid);
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
