import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from '@blockframes/auth/+state';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'event-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailComponent implements OnInit {

  constructor(
    private authStore: AuthStore,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) { }

  public eventId: string;
  public emailForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  ngOnInit() {
    this.eventId = this.route.snapshot.params.eventId;
    const { email } = this.route.snapshot.queryParams;
    this.emailForm.get('email').setValue(email)
  }

  validateForm() {
    if (!this.emailForm.valid) {
      this.snackBar.open('Form invalid, please check error messages', 'close', { duration: 2000 });
      return;
    }
    const { firstName, lastName, email } = this.emailForm.value;
    // Update store with from value
    this.authStore.updateAnonymousCredentials({ lastName, firstName, email });
    // Redirect user to email-verify page
    this.router.navigate(['../email-verify'], { relativeTo: this.route, queryParams: this.route.snapshot.queryParams });
  }

}
