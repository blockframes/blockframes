import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export const maxReleaseYear = 2030;

@Component({
  selector: '[form] filter-production-year',
  templateUrl: './production-year.component.html',
  styleUrls: ['./production-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionYearFilterComponent implements OnInit, OnDestroy {

  @Input() form: FormControl;

  private sub: Subscription;
  maxReleaseYear = maxReleaseYear;

  ngOnInit() {
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}


