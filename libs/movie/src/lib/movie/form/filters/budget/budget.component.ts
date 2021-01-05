import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

export const max = 20000000;

@Component({
  selector: '[form] filter-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetFilterComponent implements OnInit, OnDestroy {

  @Input() form: FormControl; // FormControl of number
  private sub: Subscription;

  max = max;

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
    const minBudget = max - value;
    if (minBudget >= 1000 && minBudget < 1000000) {
      return Math.round(minBudget / 1000) + 'k';
    } else if (minBudget >= 1000000) {
      return (minBudget / 1000000) + 'M';
    }

    return minBudget;
  }

}
