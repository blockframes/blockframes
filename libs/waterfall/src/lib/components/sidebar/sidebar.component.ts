import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription, combineLatest, map, startWith } from 'rxjs';
import { OrgState, RightholderRole, Statement, getChilds } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { unique } from '@blockframes/utils/helpers';

@Component({
  selector: 'waterfall-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallSidebarComponent implements OnInit, OnDestroy {

  public revenueModeControl = new FormControl<'calculated' | 'actual'>('calculated');
  public selectedStatementControl = new FormControl<Statement | undefined>(undefined);
  public highlightedRightHolderControl = new FormControl<string[]>([]);
  public hiddenRightHolderControl = new FormControl<string[]>([]);
  public highlightedSourceControl = new FormControl<string[]>([]);
  public rightHolderFilterControl = new FormControl<RightholderRole[]>([]);
  public roles$ = this.shell.rightholders$.pipe(map(rightholders => unique(rightholders.map(r => r.roles).flat())));
  public filteredRightHolders$ = new BehaviorSubject<(OrgState & { role: RightholderRole[], name: string })[]>([]);
  public statementYears$ = new BehaviorSubject<number[]>([]);
  public groupedStatements$ = new BehaviorSubject<Record<number, Statement[]>>({});

  private subs: Subscription[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(this.revenueModeControl.valueChanges.pipe(startWith(this.revenueModeControl.value)).subscribe(mode => {
      this.shell.revenueMode$.next(mode);
    }));
    this.subs.push(this.shell.statements$.subscribe(statements => {
      const sorted = statements.sort((a, b) => b.duration.to.getTime() - a.duration.to.getTime());
      const years = new Set<number>();
      const grouped: Record<number, Statement[]> = {};
      sorted.forEach(statement => {
        const year = statement.duration.to.getFullYear();
        years.add(year);
        grouped[year] ||= [];
        grouped[year].push(statement);
      });
      this.groupedStatements$.next(grouped);
      this.statementYears$.next([...years].sort((a, b) => b - a));
    }));
    this.subs.push(this.selectedStatementControl.valueChanges.subscribe(statement => {
      this.shell.setDate(statement.duration.to);
    }));
    this.subs.push(combineLatest([this.shell.state$, this.highlightedRightHolderControl.valueChanges]).subscribe(([state, rightHolderIds]) => {
      const highlightedRightIds = Object.values(state.waterfall.state.rights).filter(right => rightHolderIds.includes(right.orgId)).map(right => right.id);
      this.shell.highlightedRightIds$.next(highlightedRightIds);
    }));
    this.subs.push(this.hiddenRightHolderControl.valueChanges.subscribe(rightHolderIds => {
      this.shell.hiddenRightHolderIds$.next(rightHolderIds);
    }));
    this.subs.push(combineLatest([this.shell.waterfall$, this.shell.rights$, this.highlightedSourceControl.valueChanges]).subscribe(([waterfall, rights, sourceIds]) => {
      const sources = waterfall.sources.filter(source => sourceIds.includes(source.id));
      const rightsToHighlight = unique(sources.map(source => source.destinationId));
      const childs = rightsToHighlight.map(id => getChilds(id, rights)).flat();
      this.shell.highlightedRightIds$.next(unique(childs.map(right => right.id)));
      this.shell.highlightedSourceIds$.next(sourceIds);
    }));
    this.subs.push(combineLatest([
      this.shell.state$,
      this.rightHolderFilterControl.valueChanges.pipe(startWith([])),
      this.shell.revenueMode$,
      this.shell.rightholders$
    ]).subscribe(([state, rightHolderFilter, revenueMode, rightholders]) => {
      const filtered = Object.values(state.waterfall.state.orgs)
        .filter(org => rightholders.some(r => r.id === org.id))
        .map(org => {
          const rightHolder = rightholders.find(r => r.id === org.id);
          return { ...org, name: rightHolder.name, role: rightHolder.roles, revenue: org.revenu[revenueMode] };
        })
        .filter(org => rightHolderFilter.length === 0 || rightHolderFilter.some(r => org.role.includes(r)));
      this.filteredRightHolders$.next(filtered);
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
