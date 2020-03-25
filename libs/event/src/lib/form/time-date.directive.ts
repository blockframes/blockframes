import { forwardRef, Directive, Renderer2, ElementRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const TIME_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => TimeDateValueAccessor),
  multi: true
};

@Directive({
  // tslint:disable-next-line: directive-selector
  selector: 'input[type=time][formControlName],input[type=time][formControl],input[type=time][ngModel]',
  // tslint:disable-next-line: no-host-metadata-property
  host: {
    '(change)': 'onChange($event.target.value)',
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()'
  },
  providers: [TIME_VALUE_ACCESSOR]
})
// tslint:disable-next-line: directive-class-suffix
export class TimeDateValueAccessor implements ControlValueAccessor {
  private date: Date;
  /**
   * @description
   * The registered callback function called when a change or input event occurs on the input
   * element.
   */
  onChange = (_: any) => {};

  /**
   * @description
   * The registered callback function called when a blur event occurs on the input element.
   */
  onTouched = () => {};

  constructor(private _renderer: Renderer2, private _elementRef: ElementRef) {}

  /**
   * Sets the "value" property on the input element.
   *
   * @param value The checked value
   */
  writeValue(value: Date): void {
    this.date = value === null ? new Date() : value;
    const h = ('0' + this.date.getHours()).slice(-2);
    const m = ('0' + this.date.getMinutes()).slice(-2);
    this._renderer.setProperty(this._elementRef.nativeElement, 'value', `${h}:${m}`);
  }

  /**
   * @description
   * Registers a function called when the control value changes.
   *
   * @param fn The callback function
   */
  registerOnChange(fn: (_: Date|null) => void): void {
    this.onChange = (value: string) => {
      const [h, m] = value.split(':');
      this.date.setHours(parseInt(h, 10));
      this.date.setMinutes(parseInt(m, 10));
      fn(this.date);
    };
  }

  /**
   * @description
   * Registers a function called when the control is touched.
   *
   * @param fn The callback function
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Sets the "disabled" property on the input element.
   *
   * @param isDisabled The disabled value
   */
  setDisabledState(isDisabled: boolean): void {
    this._renderer.setProperty(this._elementRef.nativeElement, 'disabled', isDisabled);
  }
}
