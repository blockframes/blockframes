import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';

export interface DialogData {
  title: string;
}

@Component({
  selector: 'ip-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddComponent {
  constructor(
    private dialogRef: MatDialogRef<AddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
