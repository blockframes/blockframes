import { Subscription } from 'rxjs';
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
  @Input() public nonEditableNodeIds: string[] = [];
  @Input() public stateMode: 'simulation' | 'actual';

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
    this.sub = this.shell.highlightedRightIds$.subscribe(highlightedRightIds => {
      this.highlighted = this.horizontal.members.filter(member =>
        highlightedRightIds.some(rightId => {
          return (
            (member.type === 'right' && rightId === member.id) ||
            (member.type === 'vertical' && member.members.every(vMember => highlightedRightIds.some(vRightId => vRightId === vMember.id)))
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