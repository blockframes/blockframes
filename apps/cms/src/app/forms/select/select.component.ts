import { ChangeDetectionStrategy, Component, Input, ContentChild, TemplateRef, Directive, EventEmitter, Output } from '@angular/core';
import { FormField, FormList } from 'ng-form-factory';
import { Options, MatSelectSchema, MatMultiSelectSchema } from './select.schema';


@Directive({ selector: '[formOption]' })
export class SelectOptionDirective {}

@Component({
  selector: 'form-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectComponent<T> {
  private _options: Options<T>;
  @ContentChild(SelectOptionDirective) template?: TemplateRef<SelectOptionDirective>;
  @Output() change = new EventEmitter<T>();
  @Input() form: FormField<MatSelectSchema<T>, T> | FormList<MatMultiSelectSchema<T>, T>;
  @Input()
  set options(options: Options<T>) {
    if (options) this._options = options;
  }
  get options() {
    return this._options || this.schema.options;
  }

  get schema() {
    return this.form.schema;
  }

  get isArray() {
    return Array.isArray(this.options);
  }
}

