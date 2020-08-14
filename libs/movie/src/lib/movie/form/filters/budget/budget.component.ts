import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: '[form] filter-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetFilterComponent implements OnInit, OnDestroy {

  @Input() form: FormControl; // FormControl of number
  private sub: Subscription;

  ngOnInit() {
    this.sub = this.form.valueChanges.pipe(
      map(res => !!res),
      distinctUntilChanged()
    ).subscribe(isDirty => isDirty ? this.form.markAsDirty() : this.form.markAsPristine());
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  formatLabel(value: number) {
    if (value >= 1000 && value < 1000000) {
      return Math.round(value / 1000) + 'k';
    } else if (value >= 1000000) {
      return (value / 1000000) + 'M';
    }

    return value;
  }

}
