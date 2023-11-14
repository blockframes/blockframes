
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';

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


  @HostBinding('class.nodrag') nodrag = true;

  @HostListener('click') handleClick() {
    this.handleSelect.emit();
  }
}