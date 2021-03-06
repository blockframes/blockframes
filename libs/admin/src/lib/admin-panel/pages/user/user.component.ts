import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '@blockframes/auth/+state/auth.store';
import { UserAdminForm } from '../../forms/user-admin.form';
import { UserService } from '@blockframes/user/+state/user.service';
import { OrganizationService, Organization } from '@blockframes/organization/+state';
import { UserRole, PermissionsService } from '@blockframes/permissions/+state';
import { AdminService } from '@blockframes/admin/admin/+state';
import { Observable, Subscription } from 'rxjs';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Invitation, InvitationService } from '@blockframes/invitation/+state';
import { EventService } from '@blockframes/event/+state/event.service';
import { SafeResourceUrl } from '@angular/platform-browser';
import { AngularFireFunctions } from '@angular/fire/functions';

@Component({
  selector: 'admin-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  public userId = '';
  public user: User;
  public user$: Observable<User>
  public userOrg: Organization;
  public userOrgRole: UserRole;
  public isUserBlockframesAdmin = false;
  public userForm: UserAdminForm;
  public invitations: Invitation[];
  private originalOrgValue: string;

  public dashboardURL: SafeResourceUrl

  public invitationsColumns = {
    date: 'Date Created',
    mode: 'Mode',
    type: 'Type',
    'fromOrg.denomination.full': 'From Organization',
    'toOrg.denomination.full': 'To Organization',
    status: 'Status',
  };

  public initialInvitationsColumns = ['date', 'mode', 'type', 'fromOrg.denomination.full', 'toOrg.denomination.full', 'status'];

  constructor(
    private userService: UserService,
    private eventService: EventService,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private permissionService: PermissionsService,
    private adminService: AdminService,
    private invitationService: InvitationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private functions: AngularFireFunctions
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.userId = params.userId;
      this.user = await this.userService.getUser(this.userId);
      this.user$ = this.userService.valueChanges(this.userId);
      if (this.user.orgId) {
        this.originalOrgValue = this.user.orgId;
        this.userOrg = await this.organizationService.getValue(this.user.orgId);
        this.userOrgRole = await this.organizationService.getMemberRole(this.user.orgId, this.user.uid);
      }

      this.userForm = new UserAdminForm(this.user);
      this.isUserBlockframesAdmin = await this.userService.isBlockframesAdmin(this.userId);

      this.cdRef.markForCheck();
    });

    const invitationTo = await this.invitationService.getValue(ref => ref.where('toUser.uid', '==', this.userId));
    const invitationFrom = await this.invitationService.getValue(ref => ref.where('fromUser.uid', '==', this.userId));
    this.invitations = [...invitationFrom, ...invitationTo];
  }

  public async update() {
    if (this.userForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: 5000 });
      return;
    }

    const { email, orgId, firstName, lastName, phoneNumber, position } = this.userForm.value

    if (!!orgId && !!this.originalOrgValue && orgId !== this.originalOrgValue) {
      // get the users current permissions
      const permissions = await this.permissionService.getValue(this.originalOrgValue);
      const permission = permissions.roles[this.userId];

      // remove user from org
      this.organizationService.removeMember(this.userId);

      // Waiting for backend function to be triggered (which removes the orgId from a user when userId is removed from org)
      let subscription: Subscription;
      await new Promise((resolve) => {
        subscription = this.userService.valueChanges(this.userId).subscribe((res) => {
          if (!!res && res.orgId === '') {
            resolve(undefined);
          }
        })
      })
      subscription.unsubscribe();

      // add user to organization
      const org = await this.organizationService.getValue(orgId as string);
      org.userIds.push(this.userId);
      this.organizationService.update(orgId, { userIds: org.userIds });

      // add permission
      this.permissionService.updateMemberRole(this.userId, permission);
    }

    const update = {
      email,
      orgId,
      firstName,
      lastName,
      phoneNumber,
      position
    };

    await this.userService.updateById(this.user.uid, update);
    this.originalOrgValue = orgId;

    this.user = await this.userService.getUser(this.userId);
    this.cdRef.markForCheck();

    this.snackBar.open('Informations updated !', 'close', { duration: 5000 });
  }


  public async setBlockframesAdmin() {
    this.isUserBlockframesAdmin = !this.isUserBlockframesAdmin;
    await this.userService.setBlockframesAdmin(this.isUserBlockframesAdmin, this.userId);
    this.cdRef.markForCheck();
  }

  /** Update user role. */
  public async updateRole(uid: string, role: UserRole) {
    const message = await this.permissionService.updateMemberRole(uid, role);
    this.userOrgRole = role;
    this.cdRef.markForCheck();
    return this.snackBar.open(message, 'close', { duration: 2000 });
  }

  public async removeMember(uid: string) {
    try {
      await this.organizationService.removeMember(uid);
      this.snackBar.open('Member removed.', 'close', { duration: 2000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public async sendPasswordResetEmail() {
    await this.adminService.sendPasswordResetEmail(this.user.email);
    this.snackBar.open(`Reset password email sent to : ${this.user.email}`, 'close', { duration: 2000 });
  }

  public async deleteUser() {
    // check if user is not last superAdmin
    const permissions = await this.permissionService.getValue(this.user.orgId);
    if (!!this.user.orgId && !this.permissionService.hasLastSuperAdmin(permissions, this.userId, 'member')) {
      throw new Error('There must be at least one Super Admin in the organization.');
    }

    const simulation = await this.simulateDeletion(this.user);
    this.dialog.open(ConfirmInputComponent, {
      data: {
        title: 'You are currently deleting this user from Archipel, are you sure?',
        text: 'If yes, please write \'HARD DELETE\' inside the form below.',
        warning: 'This user will be deleted from the application.',
        simulation,
        confirmationWord: 'hard delete',
        confirmButtonText: 'delete',
        onConfirm: async () => {
          await this.userService.remove(this.userId);
          this.snackBar.open('User deleted !', 'close', { duration: 5000 });
          this.router.navigate(['c/o/admin/panel/users']);
        }
      }
    });
  }

  async verifyEmail() {
    this.snackBar.open('Verifying email...', 'close', { duration: 2000 });
    const f = this.functions.httpsCallable('verifyEmail');
    await f({ uid: this.userId }).toPromise(); 
    this.snackBar.open('Email verified', 'close', { duration: 2000 });
  }

  /** Simulate how many document will be deleted if we delete this user */
  private async simulateDeletion(user: User) {
    const output: string[] = [];

    // organization update
    if (user.orgId) {
      output.push('An organization will be updating without this user.');
    }

    // Calculate how many invitation will be deleted
    const invitFrom = await this.invitationService.getValue(ref => ref.where('fromUser.uid', '==', user.uid));
    const invitTo = await this.invitationService.getValue(ref => ref.where('toUser.uid', '==', user.uid));
    const allInvit = [...invitFrom, ...invitTo];
    if (allInvit.length) {
      output.push(`${allInvit.length} invitation(s) will be removed.`)
    }

    const organizerEvent = await this.eventService.getValue(ref => ref.where('meta.organizerUid', '==', user.uid));
    if (organizerEvent.length) {
      output.push(`${organizerEvent.length} meetings event(s) will have no organizer anymore.`);
    }

    return output;
  }
}
