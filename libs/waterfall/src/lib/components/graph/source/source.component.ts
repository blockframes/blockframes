
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
  @Input() editMode = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();


  @HostBinding('class.nodrag') nodrag = true;

  @HostListener('click', ['$event']) handleClick(event: MouseEvent) {
    this.handleSelect.emit(this.source.id);
    event.stopPropagation();
    event.preventDefault();
  }

  handleAddSibling(event: MouseEvent) {
    this.addSibling.emit(this.source.id);
    event.stopPropagation();
    event.preventDefault();
  }

  handleAddChild(event: MouseEvent) {
    this.addChild.emit(this.source.id);
    event.stopPropagation();
    event.preventDefault();
  }
}