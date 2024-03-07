
import { BehaviorSubject, Subscription, combineLatest, } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

import { Node } from '../layout';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';


@Component({
  selector: 'waterfall-graph-node',
  templateUrl: './node.component.html',
  styleUrls: ['./node.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphNodeComponent implements OnInit, OnDestroy {

  @Input() node: Node;
  @Input() selected = '';
  @Input() editMode = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  isHighlightedSource$ = new BehaviorSubject(false);
  isHighlightedRight$ = new BehaviorSubject(false);
  subs: Subscription[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(combineLatest([
      this.shell.state$,
      this.shell.highlightedRightHolderIds$,
    ]).subscribe(([ state, rightHolderIds ]) => {
      const highlighted = Object.values(state.waterfall.state.rights).filter(right => rightHolderIds.includes(right.orgId));
      let isHighlighted = false;
      if (this.node.type === 'right') isHighlighted = highlighted.some(right => right.id === this.node.id);
      if (this.node.type === 'vertical') isHighlighted = this.node.members.every(member => rightHolderIds.includes(member.rightHolderId))
      this.isHighlightedRight$.next(isHighlighted);
      this.cdr.markForCheck();
    }));

    this.subs.push(this.shell.highlightedSourceIds$.subscribe(sourceIds => {
      let isHighlighted = false;
      if (this.node.type !== 'source') isHighlighted = false;
      else isHighlighted = sourceIds.includes(this.node.id);
      this.isHighlightedSource$.next(isHighlighted);
      this.cdr.markForCheck();
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  verticalSelection() {
    if (this.node.type !== 'vertical') return;
    if (this.node.id === this.selected || this.isHighlightedRight$.value) return '*';

    const selectedMember = this.node.members.find(member => member.id === this.selected);
    return selectedMember?.id ?? '';
  }
}