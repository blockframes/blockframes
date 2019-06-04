import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TemplateService } from '../../+state';
import { Router } from '@angular/router';
import { Organization } from '@blockframes/organization';

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
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: { org: Organization }
  ) {}

  public addTemplate(templateName: string) {
    const templateId = this.service.addTemplate(templateName, this.data.org);
    this.close();
    this.router.navigate([`layout/templates/${templateId}`])
  }

  public close(): void {
    this.dialogRef.close();
  }
}
