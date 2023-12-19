
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { HorizontalNode } from '../layout';


@Component({
  selector: 'waterfall-graph-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphHorizontalComponent {

  @Input() horizontal: HorizontalNode;
  @Input() selected: string;
  @Input() editMode = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();
}