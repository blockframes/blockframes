// Angular
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { staticModels, staticConsts } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[scope][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent {

  public staticValue: string[] | SlugAndLabel[] = [];
  public option: string;
  @Input() set scope(value: string) {
    this.option = value;
    this.staticValue = staticModels[value]
  };
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() set withoutValues(toFilterValue: any[]) {
    this.option = staticModels[this.option].filter(scopeValue => !toFilterValue.includes(scopeValue.slug))
  }

  @ContentChild(TemplateRef) template: TemplateRef<any>;
}
