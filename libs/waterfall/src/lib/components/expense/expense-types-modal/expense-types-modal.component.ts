import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { ExpenseType } from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';
import { ExpenseTypeForm } from '../../../form/contract.form';

interface ExpenseTypeData {
  form: FormList<ExpenseType, ExpenseTypeForm>;
  versionId: 'default';
  onConfirm: () => void
}

@Component({
  selector: 'waterfall-expense-types-modal',
  templateUrl: './expense-types-modal.component.html',
  styleUrls: ['./expense-types-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpenseTypesModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ExpenseTypeData,
    public dialogRef: MatDialogRef<ExpenseTypesModalComponent>
  ) { }

  public confirm() {
    this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close() {
    this.dialogRef.close(false);
  }
}
