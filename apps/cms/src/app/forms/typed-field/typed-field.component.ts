import { ChangeDetectionStrategy, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { createForms, FormGroupSchema } from 'ng-form-factory';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { matSelect } from '../select';

type TypeOptions = 'string' | 'number' | 'boolean';
const typeOptions: TypeOptions[] = ['string', 'number', 'boolean'];

interface TypedField {
  type: TypeOptions;
  value: string | number | boolean;
}

const schema: FormGroupSchema<TypedField> = {
  form: 'group',
  controls: {
    type: matSelect<TypeOptions>({ label: 'Type', options: typeOptions }),
    value: { form: 'control' },
  }
}

@Component({
  selector: 'form-typed-field',
  templateUrl: './typed-field.component.html',
  styleUrls: ['./typed-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TypedFieldComponent),
    multi: true,
  }]
})
export class TypedFieldComponent implements ControlValueAccessor, OnInit, OnDestroy {
  private sub?: Subscription;
  form = createForms(schema, { type: 'string', value: '' });

  onChange: (v: string | number | boolean) => void = () => null;
  onTouched = () => null;

  ngOnInit() {
    this.sub = this.form.get('value').valueChanges.pipe(
      startWith(this.form.get('value').value)
    ).subscribe((v: string | number | boolean) => this.onChange(v));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  writeValue(value: string | number | boolean): void {
    const type = typeof value as 'string' | 'number' | 'boolean';
    if (typeOptions.includes(type)) {
      this.form.reset({ type, value })
    }
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }
}
