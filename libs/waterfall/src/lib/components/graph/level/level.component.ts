
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';

import { RightNode } from '../layout';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { BehaviorSubject, combineLatest, map, startWith, switchMap } from 'rxjs';


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
  @Input() public monetizationLabel = $localize`Revenue`;
  @Input() public set stateMode(mode: 'simulation' | 'actual') { this.stateMode$.next(mode); }
  private stateMode$ = new BehaviorSubject<'simulation' | 'actual'>('actual');
  @Output() handleSelect = new EventEmitter();

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

  @HostListener('click') handleClick() {
    this.handleSelect.emit();
  }
}