import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { CreateForm } from '../forms/create.form';

@Component({
  selector: 'key-manager-create-password',
  templateUrl: './create-password.component.html',
  styleUrls: ['./create-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreatePasswordComponent implements OnInit {

  form: CreateForm;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialogRef<CreatePasswordComponent>,
  ) {}

  ngOnInit() {
    this.form = new CreateForm();
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
