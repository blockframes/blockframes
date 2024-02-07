
import { Component, EventEmitter, Input, Output, Pipe, PipeTransform } from '@angular/core';

import { Condition, Right, Waterfall, WaterfallContract } from '@blockframes/model';

import { conditionToString } from './condition';
import { DashboardWaterfallShellComponent } from '../../../../dashboard/shell/shell.component';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'waterfall-condition-item',
  templateUrl: './condition-item.component.html',
  styleUrls: ['./condition-item.component.scss'],
})
export class WaterfallConditionItemComponent  {

  @Input() condition: Condition;
  @Input() @boolean disabled = false;
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();

  constructor(public shell: DashboardWaterfallShellComponent) { }
}

@Pipe({ name: 'conditionToString' })
export class ConditionToStringPipe implements PipeTransform {
  transform(condition: Condition, waterfall: Waterfall, contracts: WaterfallContract[], rights: Right[]) {
    return conditionToString(condition, waterfall, contracts, rights);
  }
}
