import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { TemplateService } from '../+state';

@Component({
  selector: 'template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateItemComponent {

  @Input() template;

  constructor(
    private service: TemplateService,
  ) { }

  public deleteTemplate(id: string) {
    this.service.deleteTemplate(id);
  }
}
