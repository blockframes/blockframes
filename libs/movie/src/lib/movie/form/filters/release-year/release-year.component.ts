import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: '[form] filter-release-year',
  templateUrl: './release-year.component.html',
  styleUrls: ['./release-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReleaseYearFilterComponent implements OnInit, OnDestroy {

  minReleaseYear = 1980;
  maxReleaseYear = 2030;
  inverted = new FormControl(this.minReleaseYear);

  @Input() form: FormControl;

  private subForm: Subscription;
  private subInverted: Subscription;

  invert = (value: number) => {
    value === undefined ? value = 0 : value
    return this.maxReleaseYear - value + this.minReleaseYear;
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(val => {
      console.log('vall --->',val);
      this.inverted.setValue(this.invert(val));
    })
    this.inverted.setValue(this.invert(this.form.value));

    this.subForm = this.form.valueChanges.subscribe(val => {
      this.inverted.setValue(this.invert(val));
    });

    this.subInverted = this.inverted.valueChanges.pipe(
      distinctUntilChanged(),
      map(this.invert)
    ).subscribe(value => {
      // console.log('SUB: form ---->', this.form);
      // console.log('SUB: inverted ---->', this.inverted.value);
      // console.log('SUB: value ---->',value);
      this.form.setValue(value);
      value ? this.form.markAsDirty() : this.form.markAsPristine();
    });
  }

  ngOnDestroy() {
    this.subForm.unsubscribe();
    this.subInverted.unsubscribe();
  }
}
