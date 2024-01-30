
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Condition } from '@blockframes/model';

import { conditionToString } from './condition';
import { DashboardWaterfallShellComponent } from '../../../../dashboard/shell/shell.component';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'waterfall-condition-item',
  templateUrl: './condition-item.component.html',
  styleUrls: ['./condition-item.component.scss'],
})
export class WaterfallConditionItemComponent implements OnInit {

  @Input() condition: Condition;
  @Input() @boolean disabled = false;
  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();

  text: string;

  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() {
    this.text = conditionToString(this.condition, this.shell.waterfall);
  }
}
