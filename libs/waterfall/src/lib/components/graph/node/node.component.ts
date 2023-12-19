
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
  @Input() selected = '';
  @Input() editMode = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();
}