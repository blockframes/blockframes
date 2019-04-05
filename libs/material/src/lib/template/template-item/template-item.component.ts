import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'template-item',
  templateUrl: './template-item.component.html',
  styleUrls: ['./template-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TemplateItemComponent {

  @Input() template;

  constructor() {
  }

  public deleteTemplate(id: string) {
    // pass
  }
}
