import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TemplateService, TemplateQuery } from '../../+state';
import { Router } from '@angular/router';

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
    private router: Router
  ) {}

  public async addTemplate(templateName: string) {
    const templateId = await this.service.addTemplate(templateName);
    this.close();
    this.router.navigate([`layout/o/templates/${templateId}`])
  }

  public close(): void {
    this.dialogRef.close();
  }
}
