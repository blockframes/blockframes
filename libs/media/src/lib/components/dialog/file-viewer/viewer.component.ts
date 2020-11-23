import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: '[ref] media-viewer',
  templateUrl: 'viewer.component.html'
})

export class ViewerDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ViewerDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { ref: string}
  ) { }

  close() {
    this.dialogRef.close();
  }
}