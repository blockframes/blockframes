import { Component, ChangeDetectionStrategy, OnInit, TemplateRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { AuthService, AuthQuery } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { InvitationService } from '@blockframes/invitation/+state';
import { slideUp, slideDown } from '@blockframes/utils/animations/fade';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp, getAppName, App } from '@blockframes/utils/apps';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { AlgoliaIndex, AlgoliaOrganization } from '@blockframes/utils/algolia';
import { OrganizationLiteForm } from '@blockframes/organization/forms/organization-lite.form';
import { IdentityForm } from '@blockframes/auth/forms/identity.form';
import { createPublicUser } from '@blockframes/user/types';
import { createOrganization, OrganizationService, PublicOrganization } from '@blockframes/organization/+state';

@Component({
  selector: 'auth-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  animations: [slideUp, slideDown],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityComponent implements OnInit {
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<any>;
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
  public isOrgFromInvitation = false;
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
    private cdr: ChangeDetectorRef
  ) { }


  ngOnInit() {
    this.app = getCurrentApp(this.routerQuery);
    this.appName = getAppName(this.app).label;

    if (!!this.query.user) {
      // Updating user (invited)
      this.updateFormForExistingUser();
    } else {
      // Creating user
      this.updateFormForNewUser();
    }
  }

  private updateFormForExistingUser() {
    this.form.get('email').setValue(this.query.user.email);
    this.form.get('email').disable();
    this.showInvitationCodeField = true;
  }

  private updateFormForNewUser() {
    this.form.removeControl('generatedPassword');
  }

  public showInvitationInputIfInvit(event: boolean) {
    this.showInvitationCodeField = event;
    this.form.get('email').disable();
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

  public setOrgFromInvitation(org: PublicOrganization) {
    this.isOrgFromAlgolia = false;
    this.isOrgFromInvitation = true;
    console.log(org)
    this.orgForm.reset();
    this.orgForm.disable();
    this.orgForm.get('denomination').get('full').setValue(org.denomination.full);
    this.orgForm.get('activity').setValue(org.activity);
    this.orgForm.get('addresses').get('main').get('country').setValue(org.addresses.main.country);
    if (org.appAccess[this.app].marketplace) {
      this.orgForm.get('appAccess').setValue('marketplace');
    }
    if (org.appAccess[this.app].dashboard) {
      this.orgForm.get('appAccess').setValue('dashboard');
    }
    this.showOrgForm = true;
    this.existingOrgId = org.id;
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

    if (!!this.query.user || !!this.isOrgFromInvitation) {
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
        // @TODO 4932 remove app-access page, guard & change email backend to admin (2 emails currently)?

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
      if (this.form.get('generatedPassword').value === this.form.get('password').value) {
        this.snackBar.open('You must choose a new password', 'close', { duration: 5000 });
        return;
      }

      this.creating = true;

      await this.authService.updatePassword(
        this.form.get('generatedPassword').value,
        this.form.get('password').value
      );

      const privacyPolicy = await this.authService.getPrivacyPolicy();
      await this.authService.update({
        _meta: createDocumentMeta({ createdFrom: this.app }),
        firstName: this.form.get('firstName').value,
        lastName: this.form.get('lastName').value,
        privacyPolicy: privacyPolicy,
      });

      // Accept the invitation from the organization.
      const invitations = await this.invitationService.getValue(ref => ref.where('mode', '==', 'invitation')
        .where('type', '==', 'joinOrganization')
        .where('toUser.uid', '==', this.query.userId));
      const pendingInvitation = invitations.find(invitation => invitation.status === 'pending');
      if (!!pendingInvitation) {
        // We put invitation to accepted only if the invitation.type is joinOrganization.
        // Otherwise, user will have to create or join an org before accepting the invitation (to attend event for example)
        await this.invitationService.update(pendingInvitation.id, { status: 'accepted' });
      }

      this.creating = false;
      this.router.navigate(['/c/o']);
    } catch (error) {
      this.creating = false;
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
