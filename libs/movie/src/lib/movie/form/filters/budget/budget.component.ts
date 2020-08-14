import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';

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
    this.sub = this.form.valueChanges.subscribe(res => !res || res === 0 ? this.form.markAsPristine() : this.form.markAsDirty());
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
