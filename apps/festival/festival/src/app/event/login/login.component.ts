import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'festival-event-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventLoginComponent implements OnInit {
  @ViewChild('noAccount') noAccountTemplate: TemplateRef<unknown>;
  public form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(24)])
  });
  public buttonText = 'Log in';
  public signinIn = false;

  constructor(
    private service: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    this.form.get('email').setValue(email);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.goBack();
  }

  async validateLogin() {
    if (this.signinIn) return;
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    this.signinIn = true;
    try {
      this.buttonText = 'Logging in...';
      const { email, password } = this.form.value;
      this.service.updateAnonymousCredentials({}, { reset: true });
      await this.service.signin(email.trim(), password);

      // Redirect user to event view
      this.router.navigate(['../../r/i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
    } catch (err) {
      this.buttonText = 'Log in';
      console.error(err); // let the devs see what happened
      if (err.message.includes('INTERNAL ASSERTION FAILED')) {
        this.snackBar.open('Network error. Please refresh this page.', 'close', { duration: 8000 });
      } else if (err.code === 'auth/user-not-found') {
        this.snackBar.openFromTemplate(this.noAccountTemplate, { duration: 8000 });
      } else {
        this.snackBar.open(err.message, 'close', { duration: 8000 });
      }
    }
    this.signinIn = false;
  }

  goBack() {
    this.service.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../../'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }
}
