import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ExpenseType, Waterfall, isStandaloneVersion } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { ExpenseTypeForm } from '../../../form/contract.form';

interface ExpenseTypeData {
  form: FormList<ExpenseType, ExpenseTypeForm>;
  versionId: 'default';
  waterfall: Waterfall;
  onConfirm: () => void
}

@Component({
  selector: 'waterfall-expense-types-modal',
  templateUrl: './expense-types-modal.component.html',
  styleUrls: ['./expense-types-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseTypesModalComponent implements OnInit {
  public isStandaloneVersion = false;
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ExpenseTypeData,
    public dialogRef: MatDialogRef<ExpenseTypesModalComponent>
  ) { }

  ngOnInit() {
    this.isStandaloneVersion = isStandaloneVersion(this.data.waterfall, this.data.versionId);
  }

  public confirm() {
    this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
