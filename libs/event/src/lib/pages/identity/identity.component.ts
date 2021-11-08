import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'event-identity',
  templateUrl: './identity.component.html',
  styleUrls: ['./identity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventIdenityComponent {
  public identityForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required])
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) { }

  validateIdentity() {
    if (!this.identityForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    // Update store with from value
    this.authService.updateAnonymousCredentials({
      lastName: this.identityForm.value.lastName,
      firstName: this.identityForm.value.firstName
    });
    // Redirect user to event view
    this.router.navigate(['../../r/i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

  clickBack() {
    this.authService.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../../'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }
}
