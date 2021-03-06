import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/+state';
import { Router } from '@angular/router';
import { createPublicUser } from '@blockframes/user/types';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '@blockframes/user/+state';
import { FormEntity } from '@blockframes/utils/form';
import { OrganizationAdminForm } from '@blockframes/admin/admin-panel/forms/organization-admin.form';
import { getOrgAppAccess } from '@blockframes/utils/apps';

@Component({
  selector: 'organization-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateComponent {
  public form = new OrganizationAdminForm();
  public superAdminForm = new FormEntity({
    email: new FormControl('', [Validators.required, Validators.email], this.emailValidator.bind(this))
  }, {
    updateOn: 'blur'
  });
  public fromApp = new FormControl('');

  constructor(
    public dialogRef: MatDialogRef<OrganizationCreateComponent>,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private orgService: OrganizationService,
    private userService: UserService,
    private router: Router,
  ) { }

  async emailValidator(control: AbstractControl): Promise<{ [key: string]: unknown } | null> {
    const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', control.value));
    return (!!existingSuperAdmin && !!existingSuperAdmin.orgId) ? { taken: true } : null;
  }

  async addOrganization() {
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }

    const superAdminEmail = this.superAdminForm.get('email').value;
    const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', superAdminEmail));

    if (!!existingSuperAdmin && !!existingSuperAdmin.orgId) {
      this.snackBar.open('User associated with this super admin email address already has an organization');
      this.superAdminForm.get('email').setValue('');
      return;
    }

    const baseUser = existingSuperAdmin
      ? existingSuperAdmin
      : await this.authService.createUser(
        superAdminEmail,
        this.form.get('denomination').get('full').value,
        this.fromApp.value
      );
    const superAdmin = createPublicUser(baseUser);

    const [firstApp] = getOrgAppAccess(this.form.value);
    const orgId = await this.orgService.addOrganization(this.form.value, firstApp, superAdmin);

    this.router.navigate(['/c/o/admin/panel/organization/', orgId]);
    this.dialogRef.close();
  }

}
