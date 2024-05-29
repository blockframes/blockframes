import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { ModuleGuard } from '@blockframes/utils/routes/module.guard';

interface ConfirmationData {
  title: string,
  question: string,
  confirm: string,
  cancel: string,
  onConfirm?: () => void
}

@Component({
  selector: 'blockframes-confirm-validate',
  templateUrl: './confirm-with-validation.component.html',
  styleUrls: ['./confirm-with-validation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmWithValidationComponent {

  acceptTerms = new UntypedFormControl(false);
  termsPath = `/c/o/${this.moduleGuard.currentModule}/terms`;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmationData,
    private moduleGuard: ModuleGuard,
    public dialogRef: MatDialogRef<ConfirmWithValidationComponent>,
  ) { }

  public confirm() {
    if (this.data.onConfirm) this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close(): void {
    this.dialogRef.close(false);
  }
}
