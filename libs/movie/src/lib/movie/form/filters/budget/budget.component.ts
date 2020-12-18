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
    const invertedValue = 20000000 - value
    if (invertedValue >= 1000 && invertedValue < 1000000) {
      return Math.round(invertedValue / 1000) + 'k';
    } else if (invertedValue >= 1000000) {
      return (invertedValue / 1000000) + 'M';
    }

    return invertedValue;
  }

}
