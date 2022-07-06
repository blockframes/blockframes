import { Component, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'festival-event-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIdenityComponent {
  public form = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    termsOfUse: new FormControl(false),
    privacyPolicy: new FormControl(false)
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.goBack();
  }

  validateIdentity() {
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
