// Angular
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { staticModels, staticConsts } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[scope][type][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent {

  @Input() type: 'constant' | 'model';

  public staticValue: string[] | SlugAndLabel[] = [];
  public option: string;
  @Input() set scope(value: string) {
    this.option = value;
    if (this.type === 'constant') {
      this.staticValue = Object.keys(staticConsts[value])
    } else {
      this.staticValue = staticModels[value]
    }
  };
  @Input() control: FormControl;
  @Input() label: string;
  @Input() hint: string;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() set withoutValues(toFilterValue: any[]) {
    if (this.type === 'constant') {
      this.staticValue = Object.keys(staticConsts[this.option]).filter(scopeValue => !toFilterValue.includes(scopeValue));
    } else {
      this.option = staticModels[this.option].filter(scopeValue => !toFilterValue.includes(scopeValue.slug))
    }
  }

  @ContentChild(TemplateRef) template: TemplateRef<any>;
}
