import { Component } from "@angular/core";
import { MatDialogRef } from "@angular/material";
import { TemplateService } from "../+state";

@Component({
  selector: 'add-template',
  template: `
    <div mat-dialog-content>
      <h2>Add a new template</h2>
      <mat-form-field appearance="outline" fxLayoutAlign="center">
        <mat-label>File name</mat-label>
        <input #templateName matInput placeholder="New template name"/>
      </mat-form-field>
    </div>
    <div mat-dialog-actions fxLayoutAlign="center">
      <button mat-stroked-button color="primary" (click)="close()">Cancel</button>
      <button mat-raised-button color="primary" (click)="addTemplate(templateName.value)">Create</button>
    </div>
  `
})
export class AddTemplateComponent {
  constructor(
    public dialogRef: MatDialogRef<AddTemplateComponent>,
    private service: TemplateService
  ) {
  }

  public addTemplate(templateName: string) {
    this.service.addTemplate(templateName);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }
}
