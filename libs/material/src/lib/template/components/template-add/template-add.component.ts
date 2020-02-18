import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TemplateService } from '../../+state/template.service';

@Component({
  selector: 'material-template-add',
  templateUrl: './template-add.component.html',
  styleUrls: ['./template-add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateAddComponent {
  @HostBinding('attr.page-id') pageId = 'template-add';

  constructor(
    public dialogRef: MatDialogRef<TemplateAddComponent>,
    private service: TemplateService,
    private router: Router
  ) {}

  public addTemplate(templateName: string) {
    const template = this.service.createTemplate(templateName);
    this.close();
    // TODO: issue#1332, relative path doesn't work.
    this.router.navigate([`c/o/delivery/templates/${template.id}`]);
  }

  public close(): void {
    this.dialogRef.close();
  }
}
