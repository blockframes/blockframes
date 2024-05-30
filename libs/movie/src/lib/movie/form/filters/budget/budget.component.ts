import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { maxBudget } from '@blockframes/model';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: '[form] filter-budget',
  templateUrl: './budget.component.html',
  styleUrls: ['./budget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BudgetFilterComponent implements OnInit, OnDestroy {

  @Input() form: FormControl<number>; // FormControl of number
  private subs: Subscription[] = [];
  public control: FormControl<number> = new FormControl();

  max = maxBudget;

  ngOnInit() {
    this.control.setValue(this.form.value);

    this.subs.push(this.form.valueChanges.subscribe(value => {
      if (value === null) this.control.setValue(null, { emitEvent: false });
    }));

    this.subs.push(this.control.valueChanges.pipe(
      map(res => !!res),
    ).subscribe(isDirty => {
      if (this.control.value === this.max) {
        this.form.setValue(-1);
      } else {
        const val = this.max - this.control.value;
        this.form.setValue(val === this.max ? null : val);
      }

      isDirty ? this.form.markAsDirty() : this.form.markAsPristine();
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub?.unsubscribe());
  }

  formatLabel(value: number) {
    const minBudget = value;
    if (minBudget >= 1000 && minBudget < 1000000) {
      return Math.round(minBudget / 1000) + 'k';
    } else if (minBudget >= 1000000) {
      return (minBudget / 1000000) + 'M';
    }

    return minBudget;
  }

}
