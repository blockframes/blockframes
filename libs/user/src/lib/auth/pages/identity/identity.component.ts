import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Optional, OnDestroy, Inject } from '@angular/core';
import { AuthService } from '../../service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/service';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { OrganizationLiteForm } from '@blockframes/organization/forms/organization-lite.form';
import { IdentityForm, IdentityFormControl } from '../../forms/identity.form';
import {
  createPublicUser,
  PublicUser,
  User,
  createOrganization,
  createDocumentMeta,
  AlgoliaOrganization,
  App,
  hasDisplayName,
  getUserLocaleId,
  PreferredLanguage,
  SupportedLanguages,
  TerritoryISOA2Value
} from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { Intercom } from '@supy-io/ngx-intercom';
import { createLocation } from '@blockframes/model';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { UntypedFormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DifferentPasswordStateMatcher, RepeatPasswordStateMatcher } from '@blockframes/utils/form/matchers';
import { filter } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { where } from 'firebase/firestore';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';
import { AlgoliaService } from '@blockframes/utils/algolia';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent implements OnInit, OnDestroy {
  public user$ = this.authService.profile$;
  public creating = false;
  public indexGroup = 'indexNameOrganizations';
  public form = new IdentityForm();
  public orgControl = new UntypedFormControl();
  public orgForm = new OrganizationLiteForm();
  public useAlgolia = true;
  public existingUser = false;
  public passwordsMatcher = new RepeatPasswordStateMatcher('password', 'confirm');
  public currentPasswordMatch = new DifferentPasswordStateMatcher('generatedPassword', 'password');

  private existingOrgId: string;
  private subs: Subscription[] = [];
  private isAnonymous = false;
  private publicUser: PublicUser;
  private defaultLocale = getUserLocaleId();
  private preferredLanguage: PreferredLanguage = {
    language: this.defaultLocale.split('-')[0] as SupportedLanguages,
    isoA2: this.defaultLocale.split('-')[1] as TerritoryISOA2Value
  }

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
    private algoliaService: AlgoliaService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App,
  ) { }


  async ngOnInit() {

    const existingUserWithDisplayName = !!this.authService.profile && !!hasDisplayName(this.authService.profile);
    const existingUserWithoutDisplayName = !!this.authService.profile && !hasDisplayName(this.authService.profile);

    // Try to set update form from query params or from existing user query (already logged in but without display name setted)
    const { code, email } = this.route.snapshot.queryParams;
    const identity = {} as IdentityFormControl;
    if (code) identity.generatedPassword = code;
    if (email || existingUserWithoutDisplayName) identity.email = email || this.authService.profile.email;

    this.form.patchValue(identity);

    this.subs.push(this.orgControl.valueChanges.subscribe(value => {
      const error = value && this.existingOrgId === undefined ? {} : undefined
      this.orgControl.setErrors(error);
    }));

    if (existingUserWithDisplayName) {
      // Updating user (already logged in and with display name setted) : user will only choose or create an org
      this.updateFormForExistingIdentity(this.authService.profile);
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

  async ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
    // We created anonymous user but it was not transformed into real one
    if (this.isAnonymous && !this.publicUser) {
      await this.authService.deleteAnonymousUser();
    }
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  private updateFormForExistingIdentity(profile: Partial<User>) {
    const user = createPublicUser(profile);
    // Fill fields
    this.form.patchValue(user);

    this.disableControls(['email', 'firstName', 'lastName', 'password', 'confirm', 'generatedPassword']);
  }

  private disableControls(keys: (keyof IdentityFormControl)[]) {
    for (const key of keys) {
      this.form.get(key).disable();
      this.form.get(key).clearValidators();
    }
  }

  public setOrg(result: AlgoliaOrganization) {
    const orgFromAlgolia = createOrganization({
      name: result.name,
      addresses: { main: createLocation({ country: result.country }) },
      activity: result.activity
    });

    this.orgForm.reset(orgFromAlgolia);
    this.orgForm.disable();
    this.orgForm.get('appAccess').setValue(result.appModule.includes('dashboard') ? 'dashboard' : 'marketplace');
    this.existingOrgId = result.objectID;
  }

  public createOrg(orgName: string) {
    const defaultOrg = this.app === 'waterfall' ? { name: orgName, appAccess: 'dashboard' } : { name: orgName };
    this.orgForm.reset(defaultOrg);
    this.orgForm.enable();
    this.existingOrgId = '';
  }

  public async signUp() {
    if (this.creating) return;
    if (this.form.invalid) {
      this.snackBar.open($localize`Please enter valid name and surname`, 'close', { duration: 2000 });
      return;
    }

    this.creating = true;

    try {
      if (!!this.authService.profile || !!this.existingUser) {
        await this.update();
      } else {
        await this.create();
      }

    } catch (err) {
      this.creating = false;
      this.cdr.markForCheck();
      switch (err.code) {
        case 'auth/email-already-in-use':
          this.snackBar.openFromComponent(SnackbarLinkComponent, {
            data: {
              message: $localize`User account already exists for this email.`,
              link: ['/auth/connexion'],
              linkName: 'LOG IN',
              testId: 'existing-email'
            },
            duration: 6000
          });
          break;
        case 'auth/invalid-email':
          this.snackBar.open($localize`Incorrect email address, please enter: text@example.com`, 'close', { duration: 5000 });
          break;
        case 'auth/wrong-password':
          this.snackBar.open($localize`Incorrect Invitation Pass. Please check your invitation email.`, 'close', { duration: 8000 });
          break;
        default:
          console.error(err); // let the devs see what happened
          this.snackBar.openFromComponent(SnackbarErrorComponent, { duration: 8000 });

          break;
      }
    }
  }

  private async create() {
    if (this.existingOrgId) {
      // Create user
      this.publicUser = await this.createUser(this.form.value);
      // Request to join existing org
      await this.invitationService.request(this.existingOrgId, this.publicUser).to('joinOrganization');
      this.snackBar.open($localize`Your account has been created and request to join org sent ! `, 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/join-congratulations']);
    } else {
      const { name, addresses, activity, appAccess } = this.orgForm.value;

      this.isAnonymous = (await this.authService.user).isAnonymous;

      // Check if the org name is already existing
      const orgId = await this.algoliaService.getOrgIdFromName(name);
      if (orgId) {
        this.orgForm.get('name').setErrors({ notUnique: true });
        this.snackBar.open($localize`This organization's name already exists.`, 'close', { duration: 2000 });
        this.creating = false;
        this.cdr.markForCheck();
        return;
      }

      // Create user
      this.publicUser = await this.createUserFromAnonymous(this.form.value);

      // Create the org
      const org = createOrganization({ name, addresses, activity });
      org.appAccess[this.app][appAccess] = true;
      await this.orgService.addOrganization(org, this.app, this.publicUser);

      this.snackBar.open($localize`Your User Account was successfully created. Please wait for our team to check your Company Information.`, 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/create-congratulations']);
    }
  }

  /**
   * Create the new auth user
   * @param user 
   * @returns PublicUser
   */
  private async createUser(user: { email, password, firstName, lastName, hideEmail }) {
    const legalTerms = await this.authService.getLegalTerms();
    const privacyPolicy = legalTerms;
    const termsAndConditions = {
      [this.app]: legalTerms
    };

    const ctx = {
      firstName: user.firstName,
      lastName: user.lastName,
      hideEmail: user.hideEmail,
      _meta: { createdFrom: this.app },
      privacyPolicy,
      termsAndConditions
    };

    if (this.app === 'waterfall') { /** @dev i18n is only on waterfall app for now #9699 */
      ctx['preferredLanguage'] = this.preferredLanguage;
    }
    const credentials = await this.authService.signup(user.email.trim(), user.password, { ctx });
    return createPublicUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uid: credentials.user.uid,
      hideEmail: user.hideEmail
    });
  }

  /**
  * Convert the anonymous user into a real one
  * @param user 
  * @returns PublicUser
  */
  private async createUserFromAnonymous(user: { email, password, firstName, lastName, hideEmail }) {
    const legalTerms = await this.authService.getLegalTerms();
    const privacyPolicy = legalTerms;
    const termsAndConditions = {
      [this.app]: legalTerms
    };

    const ctx = {
      firstName: user.firstName,
      lastName: user.lastName,
      _meta: { createdFrom: this.app, createdBy: 'anonymous', },
      hideEmail: user.hideEmail,
      privacyPolicy,
      termsAndConditions
    };

    if (this.app === 'waterfall') { /** @dev i18n is only on waterfall app for now #9699 */
      ctx['preferredLanguage'] = this.preferredLanguage;
    }
    const credentials = await this.authService.signupFromAnonymous(user.email.trim(), user.password, { ctx });
    return createPublicUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uid: credentials.user.uid,
      hideEmail: user.hideEmail
    });
  }

  private async update() {
    if (this.form.get('generatedPassword').enabled && this.form.get('password').enabled && this.form.get('generatedPassword').value === this.form.get('password').value) {
      this.snackBar.open($localize`Your new password has to be different than the invitation pass.`, 'close', { duration: 5000 });
      this.creating = false;
      this.cdr.markForCheck();
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
      const legalTerms = await this.authService.getLegalTerms();
      const privacyPolicy = legalTerms;
      const termsAndConditions = { [this.app]: legalTerms };
      const updatedUser: Partial<User> = {
        _meta: createDocumentMeta({ createdFrom: this.app }),
        firstName,
        lastName,
        privacyPolicy,
        termsAndConditions,
      };

      /** @dev i18n is only on waterfall app for now #9699 */
      if (this.app === 'waterfall') updatedUser.settings = { preferredLanguage: this.preferredLanguage };
      await this.authService.update(updatedUser);
    }

    const query = [
      where('mode', '==', 'invitation'),
      where('type', '==', 'joinOrganization'),
      where('toUser.uid', '==', this.authService.uid)
    ];
    const invitations = await this.invitationService.getValue(query);
    const pendingInvitation = invitations.find(invitation => invitation.status === 'pending');
    if (pendingInvitation) {
      // Accept the invitation from the organization.
      await this.invitationService.update(pendingInvitation.id, { status: 'accepted' });
      this.subs.push(this.authService.profile$.pipe(filter(profile => !!profile.orgId)).subscribe(() => this.router.navigate(['/c/o'])));
    } else if (this.authService.profile.orgId) {
      // User already have an orgId (created from CRM)
      this.router.navigate(['/c/o']);
    } else if (this.existingOrgId) {
      // User selected an existing org, make a request to be accepted and is redirected to waiting room
      await this.invitationService.request(this.existingOrgId, this.authService.profile).to('joinOrganization');
      this.snackBar.open($localize`Your account has been created and request to join org sent ! `, 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/join-congratulations']);
    } else {
      // User decided to create his own org and is redirected to waiting room
      const { name, addresses, activity, appAccess } = this.orgForm.value;

      // Check if the org name is already existing
      const orgId = await this.algoliaService.getOrgIdFromName(name);
      if (orgId) {
        this.orgForm.get('name').setErrors({ notUnique: true });
        this.snackBar.open($localize`This organization's name already exists.`, 'close', { duration: 2000 });
        this.creating = false;
        this.cdr.markForCheck();
        return;
      }

      const org = createOrganization({ name, addresses, activity });

      org.appAccess[this.app][appAccess] = true;
      await this.orgService.addOrganization(org, this.app, this.authService.profile);

      this.snackBar.open($localize`Your User Account was successfully created. Please wait for our team to check your Company Information.`, 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/create-congratulations']);
    }
  }

  public async searchForInvitation() {
    const email = this.form.get('email').value;
    const event = await this.invitationService.getInvitationLinkedToEmail(email);
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
    await this.authService.deleteAnonymousUserOrSignOut();
    this.router.navigate(['/']);
  }

}
