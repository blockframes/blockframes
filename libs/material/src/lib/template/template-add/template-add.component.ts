import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TemplateService } from '../+state/template.service';

@Component({
  selector: 'material-template-add',
  templateUrl: './template-add.component.html',
  styleUrls: ['./template-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateAddComponent {
  constructor(
    public dialogRef: MatDialogRef<TemplateAddComponent>,
    private service: TemplateService,
    @Inject(MAT_DIALOG_DATA) public data: { orgId: string }
  ) {}

  public addTemplate(templateName: string) {
    this.service.addTemplate(templateName, this.data.orgId);
    this.close();
  }

  public close(): void {
    this.dialogRef.close();
  }
}
