// Angular
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';

// Blockframes
import { Scope, staticConsts } from '@blockframes/utils/static-model';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: '[scope][control] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent {

  public staticValue: any[];
  public option: Scope;
  @Input() set scope(value: Scope) {
    this.option = value;
    this.staticValue = Object.keys(staticConsts[value])
  };
  @Input() control: FormControl;
  @Input() mode: 'legacy' | 'standard' | 'fill' | 'outline' = 'outline';
  @Input() placeholder: string;
  @Input() @boolean required: boolean;
  @Input() set withoutValues(toFilterValue: any[]) {
    this.staticValue = Object.keys(staticConsts[this.option]).filter(scopeValue => !toFilterValue.includes(scopeValue))
  }

  @ContentChild(TemplateRef) template: TemplateRef<any>;
}
