import { Component, ChangeDetectionStrategy, OnInit, Input, Optional } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { Organization } from '@blockframes/organization/+state';
import { appName, getOrgModuleAccess } from '@blockframes/utils/apps';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { hasDenomination, hasDisplayName } from '@blockframes/utils/helpers';
import { AngularFireFunctions } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { AppGuard } from '@blockframes/utils/routes/app.guard';

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
  private app = this.appGuard.currentApp;
  public appName = appName[this.app];
  public profileData = false;
  public orgData = false;
  public emailValidate$: Observable<boolean>;
  public orgApproval = false;

  public user = this.authService.profile;

  constructor(
    private authService: AuthService,
    private appGuard: AppGuard,
    private functions: AngularFireFunctions,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom) { }

  ngOnInit() {
    // Filled checkbox

    if (hasDisplayName(this.user) && !!this.user.email) {
      this.profileData = true;
    }

    this.emailValidate$ = this.authService.user$.pipe(map(auth => auth?.emailVerified)); // TODO #7273 since authState is only triggered via sign-in/out data is not updated when emailVerified state change
  }

  openIntercom(): void {
    return this.intercom.show();
  }

  refresh() {
    window.location.reload();
  }

  async resendEmailVerification() {
    const snack = this.snackbar.open('Sending verification email...');
    const publicUser = this.authService.profile;

    try {
      const sendVerifyEmail = this.functions.httpsCallable('sendVerifyEmailAddress');
      await sendVerifyEmail({ email: publicUser.email, publicUser, app: this.app }).toPromise();
      snack.dismiss();
      this.snackbar.open('Verification email sent.', '', { duration: 3000 });
    } catch (err) {
      snack.dismiss();
      this.snackbar.open('Something went wrong.', '', { duration: 3000 });
    }
  }
}
