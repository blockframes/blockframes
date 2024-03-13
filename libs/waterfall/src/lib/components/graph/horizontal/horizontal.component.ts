
import { Subscription, combineLatest } from 'rxjs';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { HorizontalNode } from '../layout';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';

@Component({
  selector: 'waterfall-graph-horizontal',
  templateUrl: './horizontal.component.html',
  styleUrls: ['./horizontal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphHorizontalComponent implements OnInit, OnDestroy {

  @Input() public horizontal: HorizontalNode;
  @Input() private selected: string;
  @Input() public canUpdate = false;

  @Output() addChild = new EventEmitter<string>();
  @Output() addSibling = new EventEmitter<string>();
  @Output() handleSelect = new EventEmitter<string>();

  public isVisible = false;

  private highlighted: string[] = [];
  private sub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.isVisible = this.horizontal.members.some(member =>
      (member.type === 'right' && member.width !== 0) ||
      (member.type === 'vertical' && member.members.some(vMember => vMember.width !== 0))
    );
    this.sub = combineLatest([
      this.shell.state$,
      this.shell.highlightedRightHolderIds$,
    ]).subscribe(([state, rightHolderIds]) => {
      const highlighted = Object.values(state.waterfall.state.rights).filter(right => rightHolderIds.includes(right.orgId));

      this.highlighted = this.horizontal.members.filter(member =>
        highlighted.some(right => {
          return (
            (member.type === 'right' && right.id === member.id) ||
            (member.type === 'vertical' && member.members.every(vMember => highlighted.some(vRight => vRight.id === vMember.id)))
          );
        })
      ).map(member => member.id)
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  verticalSelection(memberId: string) {
    if (this.selected === memberId) return '*';
    if (this.highlighted.includes(memberId)) return '*';
    return this.selected;
  }

  horizontalSelection(memberId: string) {
    return this.highlighted.includes(memberId) || (this.selected === memberId);
  }
}