import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'tunnel-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelConfirmComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<TunnelConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string, subtitle: string },
  ) { }

  ngOnInit() {
  }

}
