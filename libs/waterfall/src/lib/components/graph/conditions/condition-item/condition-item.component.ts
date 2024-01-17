
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Condition } from '@blockframes/model';

import { conditionToString } from './condition';


@Component({
  selector: 'waterfall-condition-item',
  templateUrl: './condition-item.component.html',
  styleUrls: ['./condition-item.component.scss'],
})
export class WaterfallConditionItemComponent implements OnInit {

  @Input() condition: Condition;

  @Output() edit = new EventEmitter();
  @Output() delete = new EventEmitter();
  
  text: string;

  ngOnInit() {
    this.text = conditionToString(this.condition);
  }
}
