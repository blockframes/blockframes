import { Component, ChangeDetectionStrategy, ViewChild, OnInit, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSidenav } from '@angular/material/sidenav';
import { SignupForm } from '../../forms/signup.form';
import { SigninForm } from '../../forms/signin.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'auth-login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  @ViewChild('signinSidenav') loginSidenav: MatSidenav;
  @ViewChild('signupSidenav') signupSidenav: MatSidenav;
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<any>;

  public isSignin = true;
  private snackbarDuration = 8000;

  constructor(
    private service: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) { }

  ngOnInit() {
    this.isSignin = !(this.route.snapshot.fragment === 'login');
    this.isSignin
      ? this.dynTitle.setPageTitle('Create an account')
      : this.dynTitle.setPageTitle('Login')
  }

  public async signin(signinForm: SigninForm) {
    if (signinForm.invalid) {
      this.snackBar.open('Information not valid', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, password } = signinForm.value;
      await this.service.signin(email.trim(), password);
      // Reset page title to default
      this.dynTitle.setPageTitle();
      const redirectTo = localStorage.getItem('redirectTo');
      if (redirectTo) {
        localStorage.removeItem('redirectTo');
        this.router.navigate([redirectTo]);
      } else {
        this.router.navigate(['c']);
      }
    } catch (err) {
      console.error(err); // let the devs see what happened
      this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
    }
  }

  public async signup(signupForm: SignupForm) {
    if (signupForm.invalid) {
      this.snackBar.open('Information not valid.', 'close', { duration: this.snackbarDuration });
      return;
    }
    try {
      const { email, password, firstName, lastName } = signupForm.value;
      await this.service.signup(email.trim(), password, { ctx: { firstName, lastName } });
      const privacyPolicy = await this.service.getPrivacyPolicy();
      await this.service.update({ privacyPolicy: privacyPolicy });
      // Reset page title to default
      this.dynTitle.setPageTitle();
      const redirectTo = localStorage.getItem('redirectTo');
      if (redirectTo) {
        localStorage.removeItem('redirectTo');
        this.router.navigate([redirectTo]);
      } else {
        this.router.navigate(['c']);
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

  get align() {
    return this.isSignin ? 'end center' : 'start center';
  }

  public refreshState() {
    this.isSignin = !this.isSignin;
    this.isSignin
      ? this.dynTitle.setPageTitle('Create an account')
      : this.dynTitle.setPageTitle('Login')
  }
}
