import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { Template } from '../../+state';

@Component({
  selector: 'template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateItemComponent {
  @Input() template: Template;
  @Output() deleted = new EventEmitter();

  public stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  public deleteTemplate() {
    this.deleted.emit();
  }
}
