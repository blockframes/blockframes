import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { OrganizationQuery } from '../../+state/organization.query';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionsQuery, UserRole, PermissionsService } from '../../../permissions/+state';
import { UserService } from '@blockframes/user/+state/user.service';
import { UserQuery } from '@blockframes/user/+state/user.query';
import { InvitationService } from '@blockframes/notification/invitation/+state/invitation.service';
import { Invitation } from '@blockframes/notification/invitation/+state/invitation.model';
import { OrganizationMember } from '@blockframes/user/+state/user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'member-edit',
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MemberComponent implements OnInit, OnDestroy {
  public orgName: string = this.query.getActive().denomination.full;

  /** Observable of all members of the organization */
  public members$: Observable<OrganizationMember[]>;

  /** Observable of all the members who asked to join the organization */
  public invitationsToJoinOrganization$: Observable<Invitation[]>;

  /** Observable of all the members invited by the organization */
  public invitationsFromOrganization$: Observable<Invitation[]>;

  public isAdmin$: Observable<boolean>;
  public isSuperAdmin$: Observable<boolean>;

  private invitationSubscription: Subscription;

  constructor(
    private query: OrganizationQuery,
    private snackBar: MatSnackBar,
    private invitationService: InvitationService,
    private permissionQuery: PermissionsQuery,
    private permissionService: PermissionsService,
    private userQuery: UserQuery,
    private userService: UserService,
    private db: AngularFirestore
  ) {}

  ngOnInit() {
    this.members$ = this.userQuery.membersWithRole$;

    this.isAdmin$ = this.permissionQuery.isAdmin$;
    this.isSuperAdmin$ = this.permissionQuery.isSuperAdmin$;

    this.invitationsFromOrganization$ = this.db
      .collection('invitations', ref => ref.where('fromOrg.id', '==', this.query.getActiveId()).where('status', '==', 'pending'))
      .valueChanges() as Observable<Invitation[]>;

    this.invitationsToJoinOrganization$ = this.db
      .collection('invitations', ref => ref.where('toOrg.id', '==', this.query.getActiveId()).where('status', '==', 'pending'))
      .valueChanges() as Observable<Invitation[]>;
  }

  public acceptInvitation(invitation: Invitation) {
    this.invitationService.acceptInvitation(invitation);
  }

  public declineInvitation(invitation: Invitation) {
    this.invitationService.declineInvitation(invitation);
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
  public updateRole(uid: string, role: UserRole) {
    if (this.permissionQuery.hasAlreadyThisRole(uid, role)) {
      return this.snackBar.open('This user already has this role.', 'close', { duration: 2000 });
    }
    try {
      if (!this.hasLastSuperAdmin(uid, role)) {
        throw new Error('There must be at least one Super Admin in the organization.');
      }
      this.permissionService.updateMemberRole(uid, role);
      this.snackBar.open('Role updated.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public removeMember(uid: string) {
    try {
      this.userService.removeMember(uid);
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.invitationSubscription.unsubscribe();
  }
}
