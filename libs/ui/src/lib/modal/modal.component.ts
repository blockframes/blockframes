import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface FormData {
  title?: string,
  subtitle?: string,
  text?: string,
  warning?: string,
  simulation?: string[],
  placeholder?: string,
  confirmationWord: string,
  confirmButtonText: string,
  cancelButtonText?: string,
  onConfirm?: () => void
}

export type View = 'FilePicker' | 'AuthPreferences' | 'ConfirmInput' | 'CookieForm';

interface Data {
  view: View,
  formData?: FormData,
  onConfirm?: () => void
}

@Component({
  selector: 'global-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalModalComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: Data,
    public dialogRef: MatDialogRef<GlobalModalComponent>,
  ) { }

  public confirm() {
    if (this.data.onConfirm) this.data.onConfirm();
    this.dialogRef.close(true);
  }

  public close(): void {
    this.dialogRef.close(false);
  }
}