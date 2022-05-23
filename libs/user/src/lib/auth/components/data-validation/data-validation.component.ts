import { Component, ChangeDetectionStrategy, OnInit, Input, Optional, Inject } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { App, getOrgModuleAccess, Organization, hasDisplayName } from '@blockframes/model';
import { BehaviorSubject } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { delay, hasDenomination } from '@blockframes/utils/helpers';
import { MatSnackBar } from '@angular/material/snack-bar';
import { APP } from '@blockframes/utils/routes/utils';
import { CallableFunctions } from 'ngfire';

@Component({
  selector: 'auth-data-validation',
  templateUrl: './data-validation.component.html',
  styleUrls: ['./data-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthDataValidationComponent implements OnInit {
  @Input() set organization(org: Organization) {
    this.orgData = hasDenomination(org);
    const isUserInOrg = org.userIds.includes(this.user.uid);
    const isOrgAccepted = org.status === "accepted";
    const orgHaveAccesToAtLeastOneModule = !!getOrgModuleAccess(org, this.app).length;
    this.orgApproval = isOrgAccepted && orgHaveAccesToAtLeastOneModule && isUserInOrg;
  };

  public profileData = false;
  public orgData = false;
  public emailValidate$ = new BehaviorSubject(false);
  public orgApproval = false;
  public user = this.authService.profile;

  constructor(
    private authService: AuthService,
    private functions: CallableFunctions,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App,
  ) { }

  ngOnInit() {
    // Filled checkbox

    if (hasDisplayName(this.user) && !!this.user.email) {
      this.profileData = true;
    }

    this.listenOnEmailVerified();
  }

  openIntercom(): void {
    return this.intercom.show();
  }

  private async listenOnEmailVerified() {
    let ms = 1000;
    let emailVerified = false;
    while (emailVerified === false) {
      const firebaseUser = await this.authService.reloadUser();
      emailVerified = firebaseUser.emailVerified;
      if (!emailVerified) await delay(ms);
      ms = ms * 2;
    }
    this.emailValidate$.next(emailVerified);
  }

  refresh() {
    window.location.reload();
  }

  async resendEmailVerification() {
    const snack = this.snackbar.open('Sending verification email...');
    const publicUser = this.authService.profile;

    try {
      await this.functions.call('sendVerifyEmailAddress', { email: publicUser.email, publicUser, app: this.app });
      snack.dismiss();
      this.snackbar.open('Verification email sent.', '', { duration: 3000 });
    } catch (err) {
      snack.dismiss();
      this.snackbar.open('Something went wrong.', '', { duration: 3000 });
    }
  }
}
