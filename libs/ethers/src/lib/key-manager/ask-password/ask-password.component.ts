import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'key-manager-ask-password',
  templateUrl: './ask-password.component.html',
  styleUrls: ['./ask-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AskPasswordComponent implements OnInit {

  form: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialogRef<AskPasswordComponent>,
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(6)]), // TODO ISSUE #408
    });
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
