import { Component, Input, Optional, Self, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, NgControl, ControlValueAccessor } from '@angular/forms';
import { FocusMonitor } from '@angular/cdk/a11y';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatFormFieldControl } from '@angular/material/form-field';

function createDate({ day, time }: { day: Date, time: string }): Date {
  const [h, m] = time.split(':');
  day.setHours(parseInt(h, 10));
  day.setMinutes(parseInt(m, 10));
  return day;
}

function getTime(date: Date): string {
  const h = ('0' + date.getHours()).slice(-2);
  const m = ('0' + date.getMinutes()).slice(-2);
  return `${h}:${m}`
}

// List of hours to display ["00:00", "00:30", ...]
const hours = (new Array(24)).fill('').map((_, i) => {
  const h = i < 10 ? `0${i}` : i;
  return [`${h}:00`, `${h}:30`];
}).flat()

@Component({
  selector: 'time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss'],
  providers: [{provide: MatFormFieldControl, useExisting: TimePickerComponent}]
})
export class TimePickerComponent implements ControlValueAccessor, MatFormFieldControl<Date>, OnDestroy {
  static ngAcceptInputType_disabled: boolean | string | null | undefined;
  static ngAcceptInputType_required: boolean | string | null | undefined;
  static nextId = 0;
  private _placeholder: string;
  private _required = false;
  private _disabled = false;

  form = new FormGroup({
    day: new FormControl(new Date()),
    time: new FormControl('00:00')
  });

  hours = hours;
  stateChanges = new Subject<void>();
  focused = false;
  errorState = false;
  controlType = 'time-picker';
  id = `time-picker_${TimePickerComponent.nextId++}`;
  describedBy = '';
  
  // PLACEHOLDER

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  // REQUIRED

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  // DISABLED

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.form.disable() : this.form.enable();
    this.stateChanges.next();
  }

  // VALUE

  @Input()
  get value(): Date | null {
    if (this.form.valid) {
      return createDate(this.form.value);
    }
    return null;
  }
  set value(day: Date | null) {
    // (todo maybe) If there is time set already don't override it
    if (!day) {
      day = new Date();
    }
    const time = getTime(day);
    this.form.setValue({ time, day });
    this.stateChanges.next();
  }

  get empty() {
    const {value: {day, time}} = this.form;
    return !day && !time;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }



  constructor(
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl
  ) {

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

  onChange = (value: Date) => {};
  onTouched = () => {};

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() !== 'input') {
      this._elementRef.nativeElement.querySelector('input').focus();
    }
  }

  writeValue(value: Date | null): void {
    this.value = value;
  }

  registerOnChange(fn: (value: Date) => void): void {
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

  setDate() {
    const value = createDate(this.form.value);
    this.onChange(value)
  }

}
