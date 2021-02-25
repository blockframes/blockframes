import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SigninForm } from '../../forms/signin.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'auth-login-view',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  @ViewChild('customSnackBarTemplate') customSnackBarTemplate: TemplateRef<any>;
  private snackbarDuration = 8000;

  constructor(
    private service: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Login')
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
      switch (err.code) {
        case 'auth/user-not-found':
          this.snackBar.openFromTemplate(this.customSnackBarTemplate, { duration: this.snackbarDuration });
          break;
        default:
          this.snackBar.open(err.message, 'close', { duration: this.snackbarDuration });
          break;
      }
    }
  }
}
