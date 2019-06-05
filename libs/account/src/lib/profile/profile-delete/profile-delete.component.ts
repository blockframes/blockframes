import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  email: string;
}

@Component({
  selector: 'account-profile-delete',
  templateUrl: './profile-delete.component.html',
  styleUrls: ['./profile-delete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileDeleteComponent  {

  constructor(
    private dialogRef: MatDialogRef<ProfileDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
