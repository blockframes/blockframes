import { Component, ChangeDetectionStrategy, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'email-form-field',
  templateUrl: './email-form-field.component.html',
  styleUrls: ['./email-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmailFormFieldComponent implements ControlValueAccessor {

  @Input() placeholder = 'Email';
  @Input() hint: string;
  @Input() required = true;
  private _value = "";

  private onTouch: (value: string) => void = () => {};
  private onChange: (value: string) => void = () => {};

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  get value() {
    const value = this._value;
    return value;
  }

  set value(value: string) {
    if (value !== undefined) {
      this._value = value;
      this.onChange(this._value);
      this.onTouch(this._value);
    }
  }

  public addEvent(event: any) {
    event.stopPropagation();
    this.value = event.target.value;
    this.onChange(this.value);
  }

  public writeValue(value: string) {
    if (value) {
      this.value = value;
      this.onChange(this.value);
    }
  }

  public registerOnChange(fn: (value: string) => void) {
    this.onChange = fn;
  }

  public registerOnTouched(fn: (value: string) => void){
    this.onTouch = fn;
  }
}
