import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvitationService } from '@blockframes/invitation/service';
import { OrganizationService } from '@blockframes/organization/service';
import { OrganizationMember, Organization, Invitation, UserRole } from '@blockframes/model';
import { buildJoinOrgQuery } from '@blockframes/invitation/invitation-utils';
import { PermissionsService } from '@blockframes/permissions/+state';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';

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
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.members$ = this.orgService.membersWithRole$;

    this.isAdmin$ = this.permissionService.isAdmin$;
    this.isSuperAdmin$ = this.permissionService.isSuperAdmin$;

    if (this.permissionService.isUserAdmin()) {
      const queryConstraints1 = buildJoinOrgQuery(this.org.id, 'invitation');
      const queryConstraints2 = buildJoinOrgQuery(this.org.id, 'request');

      this.invitationsFromOrganization$ = this.invitationService.valueChanges(queryConstraints1);
      this.invitationsToJoinOrganization$ = this.invitationService.valueChanges(queryConstraints2);
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
      this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: 'Are you sure?',
          question: 'If you remove a member from you company, you will be able to invite this person again.',
          confirm: 'Yes, remove member.',
          cancel: 'No, keep member.',
          onConfirm: async () => {
            await this.orgService.removeMember(uid);
            this.snackBar.open('Member removed.', 'close', { duration: 2000 });
          }
        }, 'small'),
        autoFocus: false
      });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
