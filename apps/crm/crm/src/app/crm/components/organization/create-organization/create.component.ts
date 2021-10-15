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
import { OrganizationCrmForm } from '@blockframes/admin/crm/forms/organization-crm.form';
import { getOrgAppAccess } from '@blockframes/utils/apps';
import { OrgEmailData } from '@blockframes/utils/emails/utils';

@Component({
  selector: 'organization-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateComponent {
  public form = new OrganizationCrmForm();
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

    const [fromApp] = getOrgAppAccess(this.form.value, this.fromApp.value);
    if (!fromApp) {
      this.snackBar.open('Please pick an app where the user is created from or give org app access', 'close', { duration: 2000 })
      return
    }

    const superAdminEmail = this.superAdminForm.get('email').value;
    const [existingSuperAdmin] = await this.userService.getValue(ref => ref.where('email', '==', superAdminEmail));

    if (!!existingSuperAdmin && !!existingSuperAdmin.orgId) {
      this.snackBar.open('User associated with this super admin email address already has an organization');
      this.superAdminForm.get('email').setValue('');
      return;
    }

    const orgEmailData: OrgEmailData = {
      denomination: this.form.get('denomination').get('full').value,
      id: '',
      email: this.form.get('email').value
    }

    const baseUser = existingSuperAdmin
      ? existingSuperAdmin
      : await this.authService.createUser(
        superAdminEmail,
        orgEmailData,
        fromApp
      );
    const superAdmin = createPublicUser(baseUser);

    const orgId = await this.orgService.addOrganization(this.form.value, fromApp, superAdmin);

    this.router.navigate(['/c/o/dashboard/crm/organization/', orgId]);
    this.dialogRef.close();
  }

}
