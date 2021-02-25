import { Component, ChangeDetectionStrategy, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, getAppName, App } from '@blockframes/utils/apps';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { AlgoliaIndex, AlgoliaOrganization } from '@blockframes/utils/algolia';
import { OrganizationLiteForm } from '@blockframes/organization/forms/organization-lite.form';
import { IdentityForm } from '@blockframes/auth/forms/identity.form';
import { createPublicUser, PublicUser } from '@blockframes/user/types';
import { createOrganization, OrganizationService } from '@blockframes/organization/+state';
import { hasIdentity } from '@blockframes/utils/helpers';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent implements OnInit {
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<any>;
  user$ = this.query.user$;
  public creating = false;
  public app: App;
  public appName: string;
  public orgIndex: AlgoliaIndex = 'org';
  public showOrgForm = false;
  private snackbarDuration = 8000;
  public form = new IdentityForm();

  public orgForm = new OrganizationLiteForm();
  public isTermsChecked: boolean;
  public showInvitationCodeField = false;
  public showPasswordField = true;
  public isOrgFromInvitation = false;
  private existingUser = false;
  public isOrgFromAlgolia = true;
  private existingOrgId: string;

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
  ) { }


  async ngOnInit() {
    const params = this.route.snapshot.queryParams;

    this.app = getCurrentApp(this.routerQuery);
    this.appName = getAppName(this.app).label;

    if (!!params.code) {
      this.form.get('generatedPassword').setValue(params.code);
    }

    if (!!this.query.user && !hasIdentity(this.query.user)) {
      // Updating user (invited)
      this.updateFormForExistingUser(this.query.user);
    } else if (!!this.query.user && !!hasIdentity(this.query.user)) {
      // Updating user (already logged in)
      this.updateFormForExistingIdentity(this.query.user);
    } else if (!!params.email) {
      this.updateFormForExistingUser({ email: params.email });
    } else {
      // Creating user
      this.updateFormForNewUser();
    }
  }

  private updateFormForExistingUser(user: Partial<PublicUser>) {
    this.form.get('email').setValue(user.email);
    this.showInvitationCodeField = true;
  }

  private updateFormForExistingIdentity(user: Partial<PublicUser>) {
    this.form.get('email').setValue(user.email);
    this.form.get('firstName').setValue(user.firstName);
    this.form.get('lastName').setValue(user.lastName);
    this.form.get('email').disable();
    this.form.get('firstName').disable();
    this.form.get('lastName').disable();
    this.form.get('password').disable();
    this.showInvitationCodeField = false;
    this.showPasswordField = false;
    this.form.get('generatedPassword').disable();
  }

  private updateFormForNewUser() {
    this.form.get('generatedPassword').disable();
  }

  public showInvitationInputIfInvit(event: boolean) {
    this.showInvitationCodeField = event;
    if (event) {
      this.existingUser = true;
      this.form.get('generatedPassword').enable();
      this.form.get('email').disable();
    }
  }

  public setOrg(result: AlgoliaOrganization) {
    this.orgForm.reset();
    this.orgForm.disable();
    this.orgForm.get('denomination').get('full').setValue(result.denomination.denomination.full);
    this.orgForm.get('activity').setValue(result.activity);
    this.orgForm.get('addresses').get('main').get('country').setValue(result.country);
    this.orgForm.get('appAccess').setValue(result.appModule.includes('marketplace') ? 'marketplace' : 'dashboard');
    this.showOrgForm = true;
    this.existingOrgId = result.objectID;
  }

  public setOrgFromInvitation(org: AlgoliaOrganization) {
    this.isOrgFromAlgolia = false;
    this.isOrgFromInvitation = true;
    this.existingUser = true;
    this.setOrg(org);
    this.cdr.markForCheck();
  }

  public createOrg(orgName: string) {
    this.orgForm.reset();
    this.orgForm.enable();
    this.orgForm.get('denomination').get('full').setValue(orgName);
    this.showOrgForm = true;
    this.existingOrgId = '';
  }

  public async signUp() {
    if (this.form.invalid) {
      this.snackBar.open('Please enter valid name and surname', 'close', { duration: 2000 });
      return;
    }

    if (!!this.query.user || !!this.existingUser) {
      await this.update();
    } else {
      await this.create();
    }
  }

  public async create() {
    try {
      this.creating = true;
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

      if (!!this.existingOrgId) {
        try {

          await this.invitationService.request(this.existingOrgId, user).to('joinOrganization');
          this.snackBar.open('Your account have been created and request to join org sent ! ', 'close', { duration: 2000 });
          this.creating = false;
          return this.router.navigate(['c/organization/join-congratulations']);
        } catch (error) {
          this.snackBar.open(error.message, 'close', { duration: 2000 });
        }
      } else {
        const { denomination, addresses, activity, appAccess } = this.orgForm.value;

        const org = createOrganization({ denomination, addresses, activity });

        org.appAccess[this.app][appAccess] = true;

        await this.orgService.addOrganization(org, this.app, user);

        this.snackBar.open('Your account have been created and your org is waiting for approval ! ', 'close', { duration: 2000 });
        this.creating = false;
        return this.router.navigate(['c/organization/create-congratulations']);
      }

    } catch (err) {

      switch (err.code) {
        case 'auth/email-already-in-use':
          this.snackBar.openFromTemplate(this.customSnackBarTemplate, { duration: this.snackbarDuration })
          break;
        default:
          console.error(err); // let the devs see what happened
          this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
          break;
      }
    }
  }


  public async update() {
    try {
      if (this.showInvitationCodeField && this.showPasswordField && this.form.get('generatedPassword').value === this.form.get('password').value) {
        this.snackBar.open('You must choose a new password', 'close', { duration: 5000 });
        return;
      }

      this.creating = true;

      const { generatedPassword, password, firstName, lastName } = this.form.value;
      const email = this.form.get('email').value; // To retreive value even if control is disabled

      if (this.showInvitationCodeField) {
        await this.authService.updatePassword(
          generatedPassword,
          password,
          email
        );
      }

      if (this.form.get('lastName').enabled && this.form.get('firstName').enabled) {
        const privacyPolicy = await this.authService.getPrivacyPolicy();
        await this.authService.update({
          _meta: createDocumentMeta({ createdFrom: this.app }),// @TODO #4932 update to updatedFrom ?
          firstName,
          lastName,
          privacyPolicy: privacyPolicy,
        });
      }

      // Accept the invitation from the organization.
      const invitations = await this.invitationService.getValue(ref => ref.where('mode', '==', 'invitation')
        .where('type', '==', 'joinOrganization')
        .where('toUser.uid', '==', this.query.userId));
      const pendingInvitation = invitations.find(invitation => invitation.status === 'pending');
      if (!!pendingInvitation) {
        // We put invitation to accepted only if the invitation.type is joinOrganization.
        // Otherwise, user will have to create or join an org before accepting the invitation (to attend event for example)
        await this.invitationService.update(pendingInvitation.id, { status: 'accepted' });
        this.creating = false;
        this.router.navigate(['/c/o']);
      } else if (!!this.query.user.orgId) {
        this.creating = false;
        this.router.navigate(['/c/o']);
      } else if (!!this.existingOrgId) {
        try {

          await this.invitationService.request(this.existingOrgId, this.query.user).to('joinOrganization');
          this.snackBar.open('Your account have been created and request to join org sent ! ', 'close', { duration: 2000 });
          this.creating = false;
          return this.router.navigate(['c/organization/join-congratulations']);
        } catch (error) {
          this.snackBar.open(error.message, 'close', { duration: 2000 });
        }
      } else {
        const { denomination, addresses, activity, appAccess } = this.orgForm.value;

        const org = createOrganization({ denomination, addresses, activity });

        org.appAccess[this.app][appAccess] = true;
        await this.orgService.addOrganization(org, this.app, this.query.user);

        this.snackBar.open('Your account have been created and your org is waiting for approval ! ', 'close', { duration: 2000 });
        this.creating = false;
        return this.router.navigate(['c/organization/create-congratulations']);
      }
    } catch (error) {
      this.creating = false;
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
