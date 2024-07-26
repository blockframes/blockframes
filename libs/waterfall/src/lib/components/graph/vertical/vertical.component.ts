import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { combineLatest, map, startWith, switchMap } from 'rxjs';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { HorizontalNode, VerticalNode } from '../layout';
import { boolean } from '@blockframes/utils/decorators/decorators';

@Component({
  selector: 'waterfall-graph-vertical',
  templateUrl: './vertical.component.html',
  styleUrls: ['./vertical.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphVerticalComponent implements OnInit {

  @Input() public vertical: VerticalNode;
  @Input() public group: HorizontalNode;
  @Input() @boolean public selected = false;
  @Input() public nonEditableNodeIds: string[] = [];

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  public amount$ = this.shell.stateMode$.pipe(
    switchMap(mode => combineLatest([mode === 'builder' ? this.shell.state$ : this.shell.simulation$, this.shell.revenueMode$])),
    map(([state, revenueMode]) => state.waterfall.state.verticals[this.vertical.id]?.revenu[revenueMode] ?? 0),
    startWith(0),
  );
  public waterfall = this.shell.waterfall;

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

}