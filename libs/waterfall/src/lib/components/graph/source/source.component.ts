
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { SourceNode } from '../layout';


@Component({
  selector: 'waterfall-graph-source',
  templateUrl: './source.component.html',
  styleUrls: ['./source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphSourceComponent {

  @Input() source: SourceNode;
  @Input() selected: boolean;

  @Output() handleSelect = new EventEmitter();
}