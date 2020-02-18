import { SlugAndLabel, Scope } from '@blockframes/utils/static-model/staticModels';
import { staticModels } from '@blockframes/utils/static-model';
import { Component, ChangeDetectionStrategy, Input, ContentChild, TemplateRef } from '@angular/core';
import { FormStaticValue } from '@blockframes/utils/form';

@Component({
  selector: '[control] [scope] static-select',
  templateUrl: './static-select.component.html',
  styleUrls: ['./static-select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaticSelectComponent {
  public _scope: SlugAndLabel[];
  @Input() set scope(value: string) {
    this._scope = staticModels[value];
  }
  @Input() control: FormStaticValue<Scope>;
  @Input() label?: string
  @ContentChild(TemplateRef, { static: false }) template: TemplateRef<any>;
}
