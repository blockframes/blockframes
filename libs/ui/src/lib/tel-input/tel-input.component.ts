// Angular
import { FormBuilder, NgControl, FormControl } from '@angular/forms';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ControlValueAccessor, FormGroup } from '@angular/forms';
import { Component, OnDestroy, Input, ElementRef, Optional, Self } from '@angular/core';
import { MatFormFieldControl } from '@angular/material/form-field';
import { FocusMonitor } from '@angular/cdk/a11y';

// RxJs
import { Subject } from 'rxjs';

/** Data structure for holding telephone number. */
export class TelephoneClass {
  constructor(public nation: string, public phoneNumber: number) { }
}

/** Custom `MatFormFieldControl` for telephone number input. */
@Component({
  selector: '[form] tel-input',
  templateUrl: './tel-input.component.html',
  styleUrls: ['./tel-input.component.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: TelInputComponent }],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.aria-describedby]': 'describedBy',
  }
})
export class TelInputComponent implements ControlValueAccessor, MatFormFieldControl<TelephoneClass>, OnDestroy {
  static nextId = 0;

  parts: FormGroup;
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  controlType = 'example-tel-input';
  id = `tel-input-${TelInputComponent.nextId++}`;
  describedBy = '';
  onChange = (_: any) => { };
  onTouched = () => { };

  get empty() {
    const { value: { nation, phoneNumber } } = this.parts;
    return !nation && !phoneNumber;
  }

  get shouldLabelFloat() { return this.focused || !this.empty; }

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder: string;

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.parts.disable() : this.parts.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): TelephoneClass | null {
    const { value: { nation, phoneNumber } } = this.parts;
    if (nation.length <= 3 && phoneNumber.length) {
      return new TelephoneClass(nation, phoneNumber);
    }
    return null;
  }
  set value(tel: TelephoneClass | null) {
    const { nation, phoneNumber } = tel || new TelephoneClass(null, null)
    this.parts.setValue({ nation, phoneNumber });
    this.stateChanges.next();
  }

  @Input()
  form: FormControl;

  constructor(
    formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl) {
    this.parts = formBuilder.group({
      nation: null,
      phoneNumber: null
    });

    _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this._elementRef.nativeElement.querySelector('input')!.focus();
    }
  }

  writeValue(tel: TelephoneClass | null): void {
    this.form.setValue(`${tel.nation}${tel.phoneNumber}`)
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(): void {
    this.onChange(this.value);
  }

  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_required: boolean | string | null | undefined;
}
