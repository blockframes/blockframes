import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'tunnel-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<TunnelConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, subtitle: string, accept: string, cancel: string },
  ) { }
}
