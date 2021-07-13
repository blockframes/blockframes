import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export const maxYear = 2030;
export const minYear = 1970;

@Component({
  selector: '[form] filter-production-year',
  templateUrl: './production-year.component.html',
  styleUrls: ['./production-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionYearFilterComponent implements OnInit, OnDestroy {

  @Input() form: FormControl;
  // We need a new FormControl to set the max year and min year values right to left
  componentForm = new FormControl();

  private sub: Subscription;
  maxYear = maxYear;
  minYear = minYear;

  ngOnInit() {
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());

    this.componentForm.setValue(minYear);
    if (this.componentForm.value >= minYear && this.componentForm.value <= maxYear) {
      this.componentForm.setValue(maxYear - this.componentForm.value + minYear);
      this.componentForm = this.form;
      return this.componentForm.value;
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  displayLabel(value: number) {
    const invertedValue =  maxYear - value + minYear;
    if (value >= minYear && value <= maxYear) {
      return invertedValue;
    }
  }
}


