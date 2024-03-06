
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

import { RightNode } from '../layout';


@Component({
  selector: 'waterfall-graph-level',
  templateUrl: './level.component.html',
  styleUrls: ['./level.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphLevelComponent implements OnChanges {

  @Input() right: RightNode;
  @Input() selected: boolean;
  @Input() @boolean hideAmount: boolean;

  @Output() handleSelect = new EventEmitter();

  @HostBinding('class.nodrag') nodrag = true;
  @HostBinding('class.selected') selectedClass = false;

  constructor(
    public shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnChanges() {
    this.selectedClass = this.selected;
  }

  @HostListener('click') handleClick() {
    this.handleSelect.emit();
  }
}