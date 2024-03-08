
// Angular
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

// Blockframes
import { WaterfallBudgetForm } from '../../../form/budget.form';
import { Waterfall } from '@blockframes/model';

@Component({
  selector: '[waterfall][form] waterfall-budget-form',
  templateUrl: './budget-form.component.html',
  styleUrls: ['./budget-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallBudgetFormComponent {

  @Input() waterfall: Waterfall;
  @Input() form: WaterfallBudgetForm;
  @Output() addedFile = new EventEmitter<boolean>(false);

  change($event: 'removed' | 'added') {
    if ($event === 'added') {
      this.addedFile.emit(true);
    } else {
      this.addedFile.emit(false);
      this.form.get('file').get('id').setValue(this.form.value.id);
    }
  }
}
