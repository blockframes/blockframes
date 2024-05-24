import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Movie, Statement, Waterfall } from '@blockframes/model';
import { dateInputFormat } from '@blockframes/utils/date-adapter';

interface StatementPaymentData {
  statement: Statement;
  movie: Movie;
  waterfall: Waterfall;
  onConfirm?: (date: Date) => void
}

@Component({
  selector: 'waterfall-statement-payment',
  templateUrl: './statement-payment.component.html',
  styleUrls: ['./statement-payment.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementPaymentComponent implements OnInit {

  public dateControl = new FormControl<Date>(new Date());
  public dateInputFormat = dateInputFormat;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementPaymentData,
    public dialogRef: MatDialogRef<StatementPaymentComponent>
  ) { }

  ngOnInit() {
    // Set default payment date to statement end date if no payment date is set
    this.dateControl.setValue(this.data.statement.duration.to);
  }

  public confirm(date: Date) {
    this.data.onConfirm(date);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
