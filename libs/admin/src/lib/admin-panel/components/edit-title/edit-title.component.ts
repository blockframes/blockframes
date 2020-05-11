import { Component, OnInit, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContractTitleDetail } from '@blockframes/contract/contract/+state';
import { TitleDetailAdminForm } from '../../forms/title-detail-admin.form';

interface TitleDialogData {
  title: string,
  titleId?: string,
  subtitle: string,
  titleDetail: ContractTitleDetail,
}

@Component({
  selector: 'admin-edit-title',
  templateUrl: './edit-title.component.html',
  styleUrls: ['./edit-title.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTitleComponent implements OnInit {
  public form: TitleDetailAdminForm;

  constructor(
    public dialogRef: MatDialogRef<EditTitleComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: TitleDialogData
  ) {

  }

  ngOnInit() {
    this.form = new TitleDetailAdminForm(this.data.titleDetail);
  }

  save() {
    if (this.form.invalid) {
      this.snackBar.open('Invalid form', '', { duration: 2000 });
      return false;
    }

    const { amount, currency, titleId } = this.form.value;
    this.data.titleDetail.price.amount = parseInt(amount, 10);
    this.data.titleDetail.price.currency = currency;
    this.data.titleDetail.titleId = titleId;

    this.dialogRef.close(this.data.titleDetail);
  }

  removeTitle() {
    this.dialogRef.close({ remove: true });
  }
}
