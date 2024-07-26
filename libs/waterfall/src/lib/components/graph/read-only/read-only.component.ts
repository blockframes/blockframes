import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { Right, Condition, WaterfallSource, isConditionGroup } from '@blockframes/model';
import { GraphService } from '@blockframes/ui/graph/graph.service';
import { CardModalComponent } from '@blockframes/ui/card-modal/card-modal.component';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { Arrow, Node, toGraph } from './../layout';

@Component({
  selector: 'waterfall-graph-read-only',
  templateUrl: './read-only.component.html',
  styleUrls: ['./read-only.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallGraphReadOnlyComponent implements OnInit, OnDestroy {
  public showDetailsPanel = false;
  public selected$ = new BehaviorSubject<string>('');
  public nodes$ = new BehaviorSubject<Node[]>([]);
  public nonEditableNodeIds$ = new BehaviorSubject<string[]>([]);
  public arrows$ = new BehaviorSubject<Arrow[]>([]);
  public rightName$ = new BehaviorSubject<string>('');
  public steps$ = new BehaviorSubject<Condition[][]>([]);

  private rights: Right[];
  private sources: WaterfallSource[];
  private sub: Subscription;

  @ViewChild(CardModalComponent, { static: true }) cardModal: CardModalComponent;

  constructor(
    private service: GraphService,
    private shell: DashboardWaterfallShellComponent
  ) { }

  ngOnInit() {
    this.sub = combineLatest([
      this.shell.rightholderRights$,
      this.shell.rightholderSources$,
      this.shell.hiddenRightHolderIds$,
    ]).subscribe(([rights, sources, hiddenRightHolderIds]) => {
      this.rights = rights;
      this.sources = sources;

      const allNodeIds = [...rights.map(r => r.id), ...this.sources.map(s => s.id)];
      this.nonEditableNodeIds$.next(allNodeIds); // All nodes are non-editable

      this.layout(hiddenRightHolderIds);
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  select(id: string) {
    if (id == this.selected$.value) return;
    if (this.cardModal.isOpened) this.cardModal.toggle();

    if (id) {
      const right = this.rights.find(right => right.id === id);
      this.showDetailsPanel = !!right && right.type !== 'horizontal';
    } else {
      this.showDetailsPanel = false;
    }

    this.selected$.next(id);
    if (!id) return;

    const source = this.sources.find(source => source.id === id);
    if (source) return;

    const right = this.rights.find(right => right.id === id);
    if (right) {
      this.steps$.next([]);
      this.rightName$.next(right.name);

      if (right.type === 'vertical') {
        const members = this.rights.filter(r => r.groupId === right.id).sort((a, b) => a.order - b.order);
        this.steps$.next(members.map(member => member.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? []));
      } else if (right.type !== 'horizontal') {
        this.steps$.value[0] = right.conditions?.conditions.filter(c => !isConditionGroup(c)) as Condition[] ?? [];
        this.steps$.next(this.steps$.value);
      }
    }
  }

  async layout(hiddenRightHolderIds: string[]) {
    const { nodes, arrows, bounds } = await toGraph(this.rights, this.sources, hiddenRightHolderIds);
    this.service.updateBounds(bounds);
    this.nodes$.next(nodes);
    this.arrows$.next(arrows);
  }
}
