
import { combineLatest, map, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

import { RightNode } from '../layout';


@Component({
  selector: 'waterfall-graph-right',
  templateUrl: './right.component.html',
  styleUrls: ['./right.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphRightComponent implements OnChanges {

  @Input() right: RightNode;
  @Input() selected: boolean;
  @Input() editMode = false;
  @Input() @boolean hideAmount: boolean;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  @HostBinding('class.nodrag') nodrag = true;
  @HostBinding('class.selected') selectedClass = false;

  amount$ = combineLatest([this.shell.state$, this.shell.isCalculatedRevenue$]).pipe(
    map(([state, isCalculatedRevenue]) => state.waterfall.state.rights[this.right.id]?.revenu[isCalculatedRevenue ? 'calculated' : 'actual'] ?? 0),
    startWith(0),
  );

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