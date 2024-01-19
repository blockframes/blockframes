import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Statement } from '@blockframes/model';
import { FormControl } from '@angular/forms';

interface StatementShareData {
  statement: Statement & { number: number };
  onConfirm?: (emails: string[]) => void
}

@Component({
  selector: 'waterfall-statement-share',
  templateUrl: './statement-share.component.html',
  styleUrls: ['./statement-share.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementShareComponent implements OnInit {

  public input: FormControl;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: StatementShareData,
    public dialogRef: MatDialogRef<StatementShareComponent>
  ) { }

  ngOnInit() {

    // this.form = new IncomeEditForm({ overrides });
  }


  public confirm() {
    //if (!this.form.valid) return;

    const emails = ['bdelorme@cascade8.com']; // TODO #9583 get from modal

    this.data.onConfirm(emails);
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
