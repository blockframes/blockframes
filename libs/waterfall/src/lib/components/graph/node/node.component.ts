
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

  verticalSelection() {
    if (this.node.type !== 'vertical') return;
    if (this.node.id === this.selected) return '*';
    else {
      const selectedMember = this.node.members.find(member => member.id === this.selected);
      if (selectedMember) return selectedMember.id;
      else return '';
    }
  }
}