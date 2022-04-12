import { Component, ChangeDetectionStrategy, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'auth-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit {
  @ViewChild('noAccount') noAccountTemplate: TemplateRef<unknown>;
  public emailForm: FormGroup;
  public submitted = false;

  constructor(
    private builder: FormBuilder,
    private service: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.emailForm = this.builder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  public async resetPassword() {
    try {
      if (this.emailForm.invalid) {
        throw new Error('Incorrect email address');
      }
      const { data: res } = await this.service.resetPasswordInit(this.emailForm.value.email);
      if (res.error === 'auth/email-not-found') {
        this.snackBar.openFromTemplate(this.noAccountTemplate, { duration: 8000 });
      } else if (res.error) {
        this.snackBar.open(res.result, 'close', { duration: 5000 });
      } else {
        this.snackBar.open('A password reset link has been sent to your email address', 'close', { duration: 5000 });
        this.submitted = true;
      }
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }
}
