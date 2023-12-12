
import { map, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, HostListener, Input, OnChanges, Output } from '@angular/core';

import { boolean } from '@blockframes/utils/decorators/decorators';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

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

  amount$ = this.shell.state$.pipe(
    map(state => state.waterfall.state.transfers[this.right.id]?.amount ?? 0),
    startWith(0),
  );

  orgName$ = this.shell.waterfall$.pipe(
    map(waterfall => waterfall.rightholders.find(r => r.id === this.right.rightHolderId)?.name ?? ''),
    startWith(''),
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
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