
import { map, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

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
  @Input() editMode = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  amount$ = this.shell.state$.pipe(
    map(state => state.waterfall.state.rights[this.vertical.id]?.revenu.calculated ?? 0),
    startWith(0),
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  handleAddSibling(event: MouseEvent) {
    this.addSibling.emit(this.vertical.id);
    event.stopPropagation();
    event.preventDefault();
  }

  handleAddChild(event: MouseEvent) {
    this.addChild.emit(this.vertical.id);
    event.stopPropagation();
    event.preventDefault();
  }
}