import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { minReleaseYear } from '../../search.form';

@Component({
  selector: '[form] filter-release-year',
  templateUrl: './release-year.component.html',
  styleUrls: ['./release-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReleaseYearFilterComponent implements OnInit, OnDestroy {

  minReleaseYear = minReleaseYear;
  maxReleaseYear = 2030;
  inverted = new FormControl(minReleaseYear);

  @Input() form: FormControl;

  private sub: Subscription;

  invert = (value: number) => this.maxReleaseYear - value + minReleaseYear;

  ngOnInit() {
    this.inverted.setValue(this.invert(this.form.value));

    this.sub = this.inverted.valueChanges.pipe(
      distinctUntilChanged(),
      map(this.invert)
    ).subscribe(value => {
      this.form.setValue(value);
      value ? this.form.markAsDirty() : this.form.markAsPristine();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
