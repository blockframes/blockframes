import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TemplateService, Template } from '../+state';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateItemComponent {
  @Input() template: Template;

  constructor(private service: TemplateService, private snackBar: MatSnackBar) {}

  public stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  public deleteTemplate(id: string) {
    this.service.deleteTemplate(id);
    this.snackBar.open('Template "' + this.template.name + '" has been deleted.', 'close', {
      duration: 2000
    });
  }
}
