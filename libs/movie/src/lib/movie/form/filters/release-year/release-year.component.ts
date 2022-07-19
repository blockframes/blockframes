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

  private subs: Subscription[] = [];

  invert = (value = 0) => this.maxReleaseYear - value + this.minReleaseYear;

  ngOnInit() {

    const formSub = this.form.valueChanges.subscribe(val => {
      this.inverted.setValue(this.invert(val));
    });

    this.subs.push(formSub);

    this.inverted.setValue(this.invert(this.form.value));

    const invertedSub = this.inverted.valueChanges.pipe(
      distinctUntilChanged(),
      map(this.invert)
    ).subscribe(value => {
      this.form.setValue(value);
      value ? this.form.markAsDirty() : this.form.markAsPristine();
    });

    this.subs.push(invertedSub);
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
