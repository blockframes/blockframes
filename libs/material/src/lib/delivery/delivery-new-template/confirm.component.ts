import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { TemplateService } from "../../template/+state/template.service";

@Component({
  selector: 'delivery-confirm',
  template: `
    <div mat-dialog-content>
      <h2>Template with name "{{data.name}}" already exists, do you want to replace it with this one ?</h2>
    </div>
    <div mat-dialog-actions fxLayoutAlign="center">
      <button mat-stroked-button color="primary" (click)="closeConfirm()">Cancel</button>
      <button mat-raised-button color="primary" (click)="saveConfirm()">
        Accept (replace template)
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ConfirmComponent {

  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    private templateService: TemplateService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  public saveConfirm() {
    //this.templateService.saveTemplate()
    this.dialogRef.close(); // TODO: navigate somewhere else and don't care anymore for closing dialogs
  }

  public closeConfirm() {
    this.dialogRef.close();
  }
}
