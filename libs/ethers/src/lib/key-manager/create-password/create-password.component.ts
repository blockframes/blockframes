import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormControl, Validators } from '@angular/forms';

function samePassword(control: FormGroup) { // TODO ISSUE #408
  const { password, confirm } = control.value;
  return password === confirm
    ? null
    : { notSame: true }
}

@Component({
  selector: 'key-manager-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePasswordComponent implements OnInit {

  form: FormGroup;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialogRef<CreatePasswordComponent>,
  ) {}

  ngOnInit() {
    this.form = new FormGroup({
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirm: new FormControl(''),
    }, { validators: [samePassword] });
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
