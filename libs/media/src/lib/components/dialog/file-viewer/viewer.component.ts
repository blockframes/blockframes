import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: '[ref] file-viewer',
  templateUrl: 'viewer.component.html',
  styleUrls: ['./viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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