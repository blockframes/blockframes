import { Component, ChangeDetectionStrategy, OnInit, Input, Optional, Inject } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { Movie, Organization } from '@blockframes/model';
import { App, getOrgModuleAccess } from '@blockframes/utils/apps';
import { Observable } from 'rxjs';
import { Intercom } from 'ng-intercom';
import { hasDenomination, hasDisplayName } from '@blockframes/utils/helpers';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/operators';
import { APP } from '@blockframes/utils/routes/utils';

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
  public emailValidate$: Observable<boolean>;
  public orgApproval = false;
  public user = this.authService.profile;

  constructor(
    private authService: AuthService,
    private functions: Functions,
    private snackbar: MatSnackBar,
    @Optional() private intercom: Intercom,
    @Inject(APP) public app: App,
  ) { }

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
      const sendVerifyEmail = httpsCallable(this.functions, 'sendVerifyEmailAddress');
      await sendVerifyEmail({ email: publicUser.email, publicUser, app: this.app });
      snack.dismiss();
      this.snackbar.open('Verification email sent.', '', { duration: 3000 });
    } catch (err) {
      snack.dismiss();
      this.snackbar.open('Something went wrong.', '', { duration: 3000 });
    }
  }
}
