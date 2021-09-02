import { Component, ChangeDetectionStrategy, OnInit, TemplateRef, ViewChild, ChangeDetectorRef, Optional, OnDestroy } from '@angular/core';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, getAppName, App } from '@blockframes/utils/apps';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { AlgoliaOrganization } from '@blockframes/utils/algolia';
import { OrganizationLiteForm } from '@blockframes/organization/forms/organization-lite.form';
import { IdentityForm, IdentityFormControl } from '@blockframes/auth/forms/identity.form';
import { createPublicUser, PublicUser } from '@blockframes/user/types';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { Intercom } from 'ng-intercom';
import { createLocation } from '@blockframes/utils/common-interfaces/utility';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent implements OnInit, OnDestroy {
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<unknown>;
  public user$ = this.query.user$;
  public creating = false;
  public app: App;
  public appName: string;
  public indexGroup = 'indexNameOrganizations';
  private snackbarDuration = 8000;
  public form = new IdentityForm();
  public orgControl = new FormControl();
  public orgForm = new OrganizationLiteForm();
  public useAlgolia = true;
  public existingUser = false;
  private existingOrgId: string;
  private sub: Subscription;

  constructor(
    private authService: AuthService,
    private query: AuthQuery,
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private routerQuery: RouterQuery,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Optional() private intercom: Intercom
  ) { }


  async ngOnInit() {
    this.app = getCurrentApp(this.routerQuery);
    this.appName = getAppName(this.app).label;

    const existingUserWithDisplayName = !!this.query.user && !!hasDisplayName(this.query.user);
    const existingUserWithoutDisplayName = !!this.query.user && !hasDisplayName(this.query.user);

    // Try to set update form from query params or from existing user query (already logged in but without display name setted)
    const { code, email } = this.route.snapshot.queryParams;
    const identity = {} as IdentityFormControl;
    if (code) identity.generatedPassword = code;
    if (email || existingUserWithoutDisplayName) identity.email = email || this.query.user.email;

    this.form.patchValue(identity);

    this.sub = this.orgControl.valueChanges.subscribe(value => {
      const error = value && this.existingOrgId === undefined ? {} : undefined
      this.orgControl.setErrors(error);
    });

    if (existingUserWithDisplayName) {
      // Updating user (already logged in and with display name setted) : user will only choose or create an org
      this.updateFormForExistingIdentity(this.query.user);
    } else {
      // Creating user
      this.form.get('generatedPassword').disable();
    }

    // Listen to changes on input email to check if there is an existing invitation
    if (this.form.get('email').value) this.searchForInvitation();

    this.form.get('email').valueChanges.pipe(debounceTime(500)).subscribe(() => {
      if (this.form.get('email').valid) this.searchForInvitation();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  private updateFormForExistingIdentity(user: Partial<PublicUser>) {
    // Fill fields
    this.form.patchValue(user);

    // Disable/hide what is not needed
    this.form.get('email').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('password').disable();
    this.form.get('generatedPassword').disable();
  }

  public setOrg(result: AlgoliaOrganization) {
    const orgFromAlgolia = createOrganization({
      denomination: { full: result.name },
      addresses: { main: createLocation({ country: result.country }) },
      activity: result.activity
    });

    this.orgForm.reset(orgFromAlgolia);
    this.orgForm.disable();
    this.orgForm.get('appAccess').setValue(result.appModule.includes('dashboard') ? 'dashboard' : 'marketplace');
    this.existingOrgId = result.objectID;
  }

  public createOrg(orgName: string) {
    this.orgForm.reset({ denomination: { full: orgName } });
    this.orgForm.enable();
    this.existingOrgId = '';
  }

  public async signUp() {
    if (this.form.invalid) {
      this.snackBar.open('Please enter valid name and surname', 'close', { duration: 2000 });
      return;
    }

    this.creating = true;

    try {
      if (!!this.query.user || !!this.existingUser) {
        await this.update();
      } else {
        await this.create();
      }

    } catch (err) {
      this.creating = false;
      this.cdr.markForCheck();
      switch (err.code) {
        case 'auth/email-already-in-use':
          this.snackBar.openFromTemplate(this.customSnackBarTemplate, { duration: this.snackbarDuration });
          break;
        default:
          console.error(err); // let the devs see what happened
          this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
          break;
      }
    }
  }

  private async create() {
    const { email, password, firstName, lastName } = this.form.value;

    const privacyPolicy = await this.authService.getPrivacyPolicy();
    const ctx = {
      firstName,
      lastName,
      _meta: { createdFrom: this.app },
      privacyPolicy
    };

    const credentials = await this.authService.signup(email.trim(), password, { ctx });
    const user = createPublicUser({
      firstName,
      lastName,
      email,
      uid: credentials.user.uid
    });

    if (this.existingOrgId) {
      await this.invitationService.request(this.existingOrgId, user).to('joinOrganization');
      this.snackBar.open('Your account has been created and request to join org sent ! ', 'close', { duration: this.snackbarDuration });
      return this.router.navigate(['c/organization/join-congratulations']);
    } else {
      const { denomination, addresses, activity, appAccess } = this.orgForm.value;

      // Check if the org name is already existing
      const unique = await this.orgService.uniqueOrgName(denomination.full);
      if (!unique) {
        this.orgForm.get('denomination').setErrors({ notUnique: true });
        this.snackBar.open('This organization\'s name already exists.', 'close', { duration: 2000 });
        this.creating = false;
        this.cdr.markForCheck();
        return;
      }

      const org = createOrganization({ denomination, addresses, activity });

      org.appAccess[this.app][appAccess] = true;

      await this.orgService.addOrganization(org, this.app, user);

      this.snackBar.open('Your User Account was successfully created. Please wait for our team to check your Company Information. ', 'close', { duration: this.snackbarDuration });
      return this.router.navigate(['c/organization/create-congratulations']);
    }
  }

  private async update() {
    if (this.form.get('generatedPassword').enabled && this.form.get('password').enabled && this.form.get('generatedPassword').value === this.form.get('password').value) {
      this.snackBar.open('You must choose a new password', 'close', { duration: 5000 });
      return;
    }

    const { generatedPassword, password, firstName, lastName } = this.form.value;
    const email = this.form.get('email').value; // To retreive value even if control is disabled

    // Password is updated only if user was asked to fill generatedPassword
    if (this.form.get('generatedPassword').enabled) {
      await this.authService.updatePassword(
        generatedPassword,
        password,
        email
      );
    }

    // User is updated only if user was asked to fill firstName & lastName
    if (this.form.get('lastName').enabled && this.form.get('firstName').enabled) {
      const privacyPolicy = await this.authService.getPrivacyPolicy();
      await this.authService.update({
        _meta: createDocumentMeta({ createdFrom: this.app }),
        firstName,
        lastName,
        privacyPolicy: privacyPolicy,
      });
    }

    const invitations = await this.invitationService.getValue(ref => ref.where('mode', '==', 'invitation')
      .where('type', '==', 'joinOrganization')
      .where('toUser.uid', '==', this.query.userId));
    const pendingInvitation = invitations.find(invitation => invitation.status === 'pending');
    if (pendingInvitation) {
      // Accept the invitation from the organization.
      await this.invitationService.update(pendingInvitation.id, { status: 'accepted' });
      this.router.navigate(['/c/o']);
    } else if (this.query.user.orgId) {
      // User already have an orgId (created from CRM)
      this.router.navigate(['/c/o']);
    } else if (this.existingOrgId) {
      // User selected an existing org, make a request to be accepted and is redirected to waiting room
      await this.invitationService.request(this.existingOrgId, this.query.user).to('joinOrganization');
      this.snackBar.open('Your account have been created and request to join org sent ! ', 'close', { duration: this.snackbarDuration });
      return this.router.navigate(['c/organization/join-congratulations']);
    } else {
      // User decided to create his own org and is redirected to waiting room
      const { denomination, addresses, activity, appAccess } = this.orgForm.value;

      // Check if the org name is already existing
      const unique = await this.orgService.uniqueOrgName(denomination.full);
      if (!unique) {
        this.orgForm.get('denomination').setErrors({ notUnique: true });
        this.snackBar.open('This organization\'s name already exists.', 'close', { duration: 2000 });
        this.creating = false;
        this.cdr.markForCheck();
        return;
      }

      const org = createOrganization({ denomination, addresses, activity });

      org.appAccess[this.app][appAccess] = true;
      await this.orgService.addOrganization(org, this.app, this.query.user);

      this.snackBar.open('Your User Account was successfully created. Please wait for our team to check your Company Information.', 'close', { duration: this.snackbarDuration });
      return this.router.navigate(['c/organization/create-congratulations']);
    }
  }

  public async searchForInvitation() {
    const event = await this.invitationService.getInvitationLinkedToEmail(this.form.get('email').value).toPromise<AlgoliaOrganization | boolean>();
    if (event) {
      this.existingUser = true;
      this.form.get('generatedPassword').enable();
      this.form.get('email').disable();
    }

    if (typeof event === 'object') { // User have an invitation to joinOrg
      this.useAlgolia = false;
      this.setOrg(event);
    } else if (!event) { // User does not have invitation
      this.form.get('generatedPassword').disable();
    }

    this.cdr.markForCheck();
  }

  public async logout() {
    await this.authService.signOut();
    this.router.navigate(['/']);
  }
}
