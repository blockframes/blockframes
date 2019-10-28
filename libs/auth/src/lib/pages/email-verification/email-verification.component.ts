import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'auth-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class EmailVerificationComponent implements OnInit {
  public emailForm: FormGroup;

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.emailForm = this.builder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public resetPassword() {
    try {
      if (this.emailForm.invalid) {
        throw new Error('Invalid format of email (must be like: cascade8@blockframes.com)');
      }
      this.service.resetPasswordInit(this.emailForm.value.email)
      this.snackBar.open('A password reset link has been sent to your email address', 'close', {duration: 5000})
    }
    catch (error) {
      this.snackBar.open(error.message, 'close', {duration: 5000})
    }
  }
}
