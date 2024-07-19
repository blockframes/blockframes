import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';
import { Router } from '@angular/router';
import { createPublicUser, getOrgAppAccess, OrgEmailData, supportedLanguages, SupportedLanguages } from '@blockframes/model';
import { AuthService } from '@blockframes/auth/service';
import { UntypedFormControl, Validators, AbstractControl, FormControl } from '@angular/forms';
import { UserService } from '@blockframes/user/service';
import { FormEntity } from '@blockframes/utils/form';
import { OrganizationCrmForm } from '@blockframes/admin/crm/forms/organization-crm.form';
import { where } from 'firebase/firestore';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'organization-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizationCreateComponent implements OnInit, OnDestroy {
  public form = new OrganizationCrmForm();
  public superAdminForm = new FormEntity({
    email: new UntypedFormControl('', [Validators.required, Validators.email], this.emailValidator.bind(this)),
    preferredLanguage: new FormControl<SupportedLanguages>('en')
  }, { updateOn: 'blur' });
  public fromApp = new UntypedFormControl('');
  public languages = supportedLanguages;
  public showPreferredLanguage$ = new BehaviorSubject<boolean>(false);
  public creatingOrg = false;
  private subscription: Subscription;

  constructor(
    public dialogRef: MatDialogRef<OrganizationCreateComponent>,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private orgService: OrganizationService,
    private userService: UserService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.subscription = this.form.get('appAccess').get('waterfall').get('dashboard').valueChanges.subscribe(value => {
      if (value === false) this.superAdminForm.get('preferredLanguage').setValue('en');
      this.showPreferredLanguage$.next(value);
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  async emailValidator(control: AbstractControl): Promise<{ [key: string]: unknown } | null> {
    const [existingSuperAdmin] = await this.userService.getValue([where('email', '==', control.value)]);
    return (!!existingSuperAdmin && !!existingSuperAdmin.orgId) ? { taken: true } : null;
  }

  isFormValid() {
    return this.form.valid && this.superAdminForm.valid;
  }

  async addOrganization() {
    this.creatingOrg = true;

    if (this.form.get('name').value?.trim() === '') {
      this.form.get('name').setErrors({ required: true });
    }

    if (!this.isFormValid()) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      this.creatingOrg = false;
      return;
    }

    const [fromApp] = getOrgAppAccess(this.form.value, this.fromApp.value);
    if (!fromApp) {
      this.snackBar.open('Please pick an app where the user is created from or give org app access', 'close', { duration: 2000 });
      this.creatingOrg = false;
      return;
    }

    const superAdminEmail = this.superAdminForm.get('email').value;
    const [existingSuperAdmin] = await this.userService.getValue([where('email', '==', superAdminEmail)]);

    const preferredLanguage: SupportedLanguages = this.superAdminForm.get('preferredLanguage').value;

    if (!!existingSuperAdmin && !!existingSuperAdmin.orgId) {
      this.snackBar.open('User associated with this super admin email address already has an organization');
      this.superAdminForm.get('email').setValue('');
      this.creatingOrg = false;
      return;
    }

    const orgEmailData: OrgEmailData = {
      name: this.form.get('name').value,
      id: '',
      email: this.form.get('email').value
    }

    const baseUser = existingSuperAdmin
      ? existingSuperAdmin
      : await this.authService.createUser(
        superAdminEmail,
        orgEmailData,
        fromApp,
        preferredLanguage
      );
    const superAdmin = createPublicUser(baseUser);

    const orgId = await this.orgService.addOrganization(this.form.value, fromApp, superAdmin);

    this.router.navigate(['/c/o/dashboard/crm/organization/', orgId]);
    this.dialogRef.close();
    this.creatingOrg = false;
  }

}
