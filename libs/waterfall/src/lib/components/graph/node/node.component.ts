
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { Node } from '../layout';


@Component({
  selector: 'waterfall-graph-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphNodeComponent {

  @Input() node: Node;
  @Input() selected = false;

  @Output() handleSelect = new EventEmitter();

}