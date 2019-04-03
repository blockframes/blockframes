import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { TemplateService } from '../../template/+state/template.service';
import { ConfirmComponent } from './confirm.component';

@Component({
  selector: 'delivery-new-template',
  template: `
    <div mat-dialog-content>
      <h2>Save as a new template</h2>
      <mat-form-field appearance="outline" fxLayoutAlign="center">
        <mat-label>File name</mat-label>
        <input #templateName matInput placeholder="New template name" required/>
      </mat-form-field>
    </div>
    <div mat-dialog-actions fxLayoutAlign="center">
      <button mat-stroked-button color="primary" (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="saveTemplate(templateName.value)" [disabled]="!templateName.value">
        Save Template
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewTemplateComponent {
  constructor(
    private dialogRef: MatDialogRef<NewTemplateComponent>,
    private templateService: TemplateService,
    private dialog: MatDialog
  ) {}

  public async saveTemplate(name: string) {
    if (await this.templateService.nameExists(name)) {
      this.dialog.open(ConfirmComponent, {
        data: {
          name
        }
      });
    } else {
      this.templateService.saveTemplate(name);
      this.dialogRef.close();
    }
  }

  public close() {
    this.dialogRef.close();
  }
}
