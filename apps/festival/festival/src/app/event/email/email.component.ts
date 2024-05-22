import { Component, ChangeDetectionStrategy, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

@Component({
  selector: 'festival-event-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailComponent implements OnInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  public form = new UntypedFormGroup({
    firstName: new UntypedFormControl('', [Validators.required]),
    lastName: new UntypedFormControl('', [Validators.required]),
    email: new UntypedFormControl('', [Validators.required, Validators.email]),
    termsOfUse: new UntypedFormControl(false),
    privacyPolicy: new UntypedFormControl(false),
  });

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.goBack();
  }
  
  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    this.form.get('email').setValue(email);
  }

  validateForm() {
    if (!this.form.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    // Update store with from value
    this.authService.updateAnonymousCredentials(this.form.value);
    // Redirect user to event view
    this.router.navigate(['../../r/i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

  goBack() {
    this.authService.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../../'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

}
