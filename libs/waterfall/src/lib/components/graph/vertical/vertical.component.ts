
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { VerticalNode } from '../layout';


@Component({
  selector: 'waterfall-graph-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphVerticalComponent {

  @Input() vertical: VerticalNode;
  @Input() selected: boolean;

  @Output() handleSelect = new EventEmitter<string>();
}