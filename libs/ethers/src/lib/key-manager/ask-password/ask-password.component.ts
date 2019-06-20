import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { PasswordForm } from '../forms/password.form';

@Component({
  selector: 'key-manager-ask-password',
  templateUrl: './ask-password.component.html',
  styleUrls: ['./ask-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskPasswordComponent implements OnInit {

  form: PasswordForm;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialogRef<AskPasswordComponent>,
  ) {}

  ngOnInit() {
    this.form = new PasswordForm();
  }

  cancel() {
    this.dialog.close();
  }

  async returnPassword() {
    if (!this.form.valid) {
      this.snackBar.open('Invalid values', 'close', { duration: 1000 });
      return;
    }
    this.dialog.close(this.form.value.password);
  }
}
