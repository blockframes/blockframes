
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';

import { RightNode } from '../layout';


@Component({
  selector: 'waterfall-graph-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphRightComponent {

  @Input() right: RightNode;
  @Input() selected: boolean;
  @Input() @boolean hideAmount: boolean;

  @Output() handleSelect = new EventEmitter();
}