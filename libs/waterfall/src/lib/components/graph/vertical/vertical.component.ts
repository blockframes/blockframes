
import { combineLatest, map, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

import { VerticalNode } from '../layout';


@Component({
  selector: 'waterfall-graph-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphVerticalComponent implements OnInit {

  @Input() vertical: VerticalNode;
  @Input() selected: '' | '*' | string;
  @Input() editMode = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  amount$ = combineLatest([this.shell.state$, this.shell.isCalculatedRevenue$]).pipe(
    map(([state, isCalculatedRevenue]) => state.waterfall.state.rights[this.vertical.id]?.revenu[isCalculatedRevenue ? 'calculated' : 'actual'] ?? 0),
    startWith(0),
  );

  isVisible = false;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.isVisible = this.vertical.members.some(member => member.width !== 0);
  }

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

  select(stepId: string) {
    if (this.selected === '') this.handleSelect.emit(this.vertical.id);
    else if (this.selected === '*') this.handleSelect.emit(stepId);
    else {
      if (this.selected === stepId) this.handleSelect.emit(this.vertical.id);
      else this.handleSelect.emit(stepId);
    }
  }
}