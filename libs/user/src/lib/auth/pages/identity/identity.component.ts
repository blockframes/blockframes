import { Component, ChangeDetectionStrategy, OnInit, ChangeDetectorRef, Optional, OnDestroy, Inject } from '@angular/core';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { OrganizationLiteForm } from '@blockframes/organization/forms/organization-lite.form';
import { IdentityForm, IdentityFormControl } from '@blockframes/auth/forms/identity.form';
import { createPublicUser, PublicUser, User, createOrganization, createDocumentMeta, AlgoliaOrganization, App } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/+state';
import { hasDisplayName } from '@blockframes/utils/helpers';
import { Intercom } from 'ng-intercom';
import { createLocation } from '@blockframes/utils/common-interfaces/utility';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DifferentPasswordStateMatcher, RepeatPasswordStateMatcher } from '@blockframes/utils/form/matchers';
import { filter } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';
import { where } from 'firebase/firestore';
import { SnackbarLinkComponent } from '@blockframes/ui/snackbar/link/snackbar-link.component';
import { SnackbarErrorComponent } from '@blockframes/ui/snackbar/error/snackbar-error.component';

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
  public orgControl = new FormControl();
  public orgForm = new OrganizationLiteForm();
  public useAlgolia = true;
  public existingUser = false;
  public passwordsMatcher = new RepeatPasswordStateMatcher('password', 'confirm');
  public currentPasswordMatch = new DifferentPasswordStateMatcher('generatedPassword', 'password');

  private existingOrgId: string;
  private subs: Subscription[] = [];
  private isAnonymous = false;
  private publicUser: PublicUser;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private invitationService: InvitationService,
    private orgService: OrganizationService,
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
    if (this.creating) return;
    if (this.form.invalid) {
      this.snackBar.open('Please enter valid name and surname', 'close', { duration: 2000 });
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
              message: 'User account already exists for this email.',
              link: ['/auth/connexion'],
              linkName: 'LOG IN',
              testId: 'existing-email'
            },
            duration: 6000
          });
          break;
        case 'auth/invalid-email':
          this.snackBar.open('Incorrect email address, please enter: text@example.com', 'close', { duration: 5000 });
          break;
        case 'auth/wrong-password':
          this.snackBar.open('Incorrect Invitation Pass. Please check your invitation email.', 'close', { duration: 8000 });
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
      this.snackBar.open('Your account has been created and request to join org sent ! ', 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/join-congratulations']);
    } else {
      const { denomination, addresses, activity, appAccess } = this.orgForm.value;


      /**
       * @dev This anonymous user is used to call "this.orgService.uniqueOrgName()"
       * without forcing us to allow orgs collection reads for non-logged-in users in firestore rules
       * Once the account is converted from anonymous to real, authState will remain as anonymous for a few seconds 
       * (this explain the need to allow the anonymous sign-in for user update in firestore rules)
       * #6908
       */
      await this.authService.signInAnonymously();
      this.isAnonymous = (await this.authService.user).isAnonymous;

      // Check if the org name is already existing
      const unique = await this.orgService.uniqueOrgName(denomination.full);
      if (!unique) {
        this.orgForm.get('denomination').setErrors({ notUnique: true });
        this.snackBar.open('This organization\'s name already exists.', 'close', { duration: 2000 });
        this.creating = false;
        this.cdr.markForCheck();
        return;
      }

      // Create user
      this.publicUser = await this.createUserFromAnonymous(this.form.value);

      // Create the org
      const org = createOrganization({ denomination, addresses, activity });
      org.appAccess[this.app][appAccess] = true;
      await this.orgService.addOrganization(org, this.app, this.publicUser);

      this.snackBar.open('Your User Account was successfully created. Please wait for our team to check your Company Information. ', 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/create-congratulations']);
    }
  }

  /**
   * Create the new auth user
   * @param user 
   * @returns PublicUser
   */
  private async createUser(user: { email, password, firstName, lastName, hideEmail }) {
    const privacyPolicy = await this.authService.getPrivacyPolicy();
    const ctx = {
      firstName: user.firstName,
      lastName: user.lastName,
      hideEmail: user.hideEmail,
      _meta: { createdFrom: this.app },
      privacyPolicy
    };
    const credentials = await this.authService.signup(user.email.trim(), user.password, { ctx });
    return createPublicUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uid: credentials.user.uid,
      hideEmail: user.hideEmail,
    });
  }

  /**
  * Convert the anonymous user into a real one
  * @param user 
  * @returns PublicUser
  */
  private async createUserFromAnonymous(user: { email, password, firstName, lastName }) {
    const privacyPolicy = await this.authService.getPrivacyPolicy();
    const ctx = {
      firstName: user.firstName,
      lastName: user.lastName,
      _meta: { createdFrom: this.app, createdBy: 'anonymous', },
      privacyPolicy
    };
    const credentials = await this.authService.signupFromAnonymous(user.email.trim(), user.password, { ctx });
    return createPublicUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      uid: credentials.user.uid
    });
  }


  private async update() {
    if (this.form.get('generatedPassword').enabled && this.form.get('password').enabled && this.form.get('generatedPassword').value === this.form.get('password').value) {
      this.snackBar.open('Your new password has to be different than the invitation pass.', 'close', { duration: 5000 });
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
      const privacyPolicy = await this.authService.getPrivacyPolicy();
      await this.authService.update({
        _meta: createDocumentMeta({ createdFrom: this.app }),
        firstName,
        lastName,
        privacyPolicy: privacyPolicy,
      });
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
      this.snackBar.open('Your account have been created and request to join org sent ! ', 'close', { duration: 8000 });
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
      await this.orgService.addOrganization(org, this.app, this.authService.profile);

      this.snackBar.open('Your User Account was successfully created. Please wait for our team to check your Company Information.', 'close', { duration: 8000 });
      return this.router.navigate(['c/organization/create-congratulations']);
    }
  }

  public async searchForInvitation() {
    const { data: event } = await this.invitationService.getInvitationLinkedToEmail(this.form.get('email').value);
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
