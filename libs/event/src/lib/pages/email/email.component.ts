import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventQuery } from '@blockframes/event/+state';

@Component({
  selector: 'event-email',
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
    private eventQuery: EventQuery,
  ) { }

  public eventId = this.eventQuery.getActiveId();
  public emailForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  ngOnInit() {
    const { email } = this.route.snapshot.queryParams;
    this.emailForm.get('email').setValue(email);
  }

  validateForm() {
    if (!this.emailForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    const { firstName, lastName, email } = this.emailForm.value;
    // Update store with from value
    this.authService.updateAnonymousCredentials({ lastName, firstName, email });
    // Redirect user to event view
    this.router.navigate(['../i'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

  clickBack() {
    this.authService.updateAnonymousCredentials({ role: undefined });
    this.router.navigate(['../../'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

}
