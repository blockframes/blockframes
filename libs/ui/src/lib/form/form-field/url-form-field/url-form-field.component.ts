import { Component, ChangeDetectionStrategy, Input, Optional, Self } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'url-form-field',
  templateUrl: './url-form-field.component.html',
  styleUrls: ['./url-form-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class UrlFormFieldComponent implements ControlValueAccessor {

  @Input() placeholder = 'https://';
  @Input() hint: string;
  @Input() required = false;
  private _value = "";

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
    if (value) {
      this._value = value;
      this.propagateChange(this._value);
    }
  }

  public addEvent(value: string) {
    this.value = value;
    this.propagateChange(this.value);
  }

  public writeValue(value: string) {
    if (value) {
      this.value = value;
      this.propagateChange(this.value);
    }
  }

  public propagateChange = (_: any) => {};

  public registerOnChange(fn) {
    this.propagateChange = fn;
  }

  public registerOnTouched() {}
}
