
// Angular
import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

// Blockframes
import { WaterfallFinancingPlanForm } from '../../../form/financing-plan.form';
import { Waterfall } from '@blockframes/model';

@Component({
  selector: '[waterfall][form] waterfall-financing-plan-form',
  templateUrl: './financing-plan-form.component.html',
  styleUrls: ['./financing-plan-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallFinancingPlanFormComponent {

  @Input() waterfall: Waterfall;
  @Input() form: WaterfallFinancingPlanForm;
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
