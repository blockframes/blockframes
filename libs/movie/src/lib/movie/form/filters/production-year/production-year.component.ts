import { formatDate } from '@angular/common';
import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { ReleaseYearForm } from '../../movie.form';

export const max = 20000000;



@Component({
  selector: '[form] filter-production-year',
  templateUrl: './production-year.component.html',
  styleUrls: ['./production-year.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionYearFilterComponent implements OnInit, OnDestroy {

  @Input() form: ReleaseYearForm; // FormControl of number
  private sub: Subscription;

  // max = max;


  minYear = 1970;
  maxYear = 2030;
  min = this.minYear;
  max = this.maxYear;

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


