
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output } from '@angular/core';
import { BehaviorSubject, combineLatest, map, startWith, switchMap } from 'rxjs';
import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { HorizontalNode, RightNode, VerticalNode } from '../layout';

@Component({
  selector: 'waterfall-graph-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphRightComponent implements OnChanges {

  @Input() public right: RightNode;
  @Input() public group: HorizontalNode | VerticalNode;
  @Input() public selected: boolean;
  @Input() public nonEditableNodeIds: string[] = [];
  @Input() @boolean public hideAmount: boolean;
  @Input() public monetizationLabel = $localize`Total Revenue`;
  @Input() public set stateMode(mode: 'simulation' | 'actual') { this.stateMode$.next(mode); }
  private stateMode$ = new BehaviorSubject<'simulation' | 'actual'>('actual');

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  @HostBinding('class.nodrag') nodrag = true;
  @HostBinding('class.selected') selectedClass = false;

  public amount$ = this.stateMode$.pipe(
    switchMap(mode => combineLatest([mode === 'actual' ? this.shell.state$ : this.shell.simulation$, this.shell.revenueMode$])),
    map(([state, revenueMode]) => state.waterfall.state.rights[this.right.id]?.revenu[revenueMode] ?? 0),
    startWith(0),
  );
  public waterfall = this.shell.waterfall;

  constructor(
    public shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnChanges() {
    this.selectedClass = this.selected;
  }

  @HostListener('click', ['$event']) handleClick(event: MouseEvent) {
    this.handleSelect.emit(this.right.id);
    event.stopPropagation();
    event.preventDefault();
  }

  handleAddSibling(event: MouseEvent) {
    this.addSibling.emit(this.right.id);
    event.stopPropagation();
    event.preventDefault();
  }

  handleAddChild(event: MouseEvent) {
    this.addChild.emit(this.right.id);
    event.stopPropagation();
    event.preventDefault();
  }
}