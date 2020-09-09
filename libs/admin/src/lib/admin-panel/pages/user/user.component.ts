import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { User } from '@blockframes/auth/+state/auth.store';
import { UserAdminForm } from '../../forms/user-admin.form';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '@blockframes/user/+state/user.service';
import { OrganizationService, Organization } from '@blockframes/organization/+state';
import { UserRole, PermissionsService } from '@blockframes/permissions/+state';
import { AdminService } from '@blockframes/admin/admin/+state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'admin-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserComponent implements OnInit {
  public userId = '';
  public user: User;
  public userOrg: Organization;
  public userOrgRole: UserRole;
  public isUserBlockframesAdmin = false;
  public userForm: UserAdminForm;
  private originalOrgValue: string;

  constructor(
    private userService: UserService,
    private organizationService: OrganizationService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private permissionService: PermissionsService,
    private adminService: AdminService,
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.userId = params.userId;
      this.user = await this.userService.getUser(this.userId);
      if (this.user.orgId) {
        this.originalOrgValue = this.user.orgId;
        this.userOrg = await this.organizationService.getValue(this.user.orgId);
        this.userOrgRole = await this.organizationService.getMemberRole(this.user.orgId, this.user.uid);
      }

      this.userForm = new UserAdminForm(this.user);
      this.isUserBlockframesAdmin = await this.userService.isBlockframesAdmin(this.userId);
      this.cdRef.markForCheck();
    });
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
            resolve();
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
}
