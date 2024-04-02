import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, map, startWith } from 'rxjs';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { VerticalNode } from '../layout';

@Component({
  selector: 'waterfall-graph-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphVerticalComponent implements OnInit {

  @Input() public vertical: VerticalNode;
  @Input() public selected: '' | '*' | string;
  @Input() public canUpdate = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  public amount$ = combineLatest([this.shell.state$, this.shell.revenueMode$]).pipe(
    map(([state, revenueMode]) => state.waterfall.state.verticals[this.vertical.id]?.revenu[revenueMode] ?? 0),
    startWith(0),
  );

  public isVisible = false;

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