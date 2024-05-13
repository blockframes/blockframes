import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription, combineLatest, map, startWith } from 'rxjs';
import {
  OrgState,
  RightholderRole,
  Statement,
  filterStatements,
  getChilds,
  getStatementNumber,
  rightholderKey,
  sortStatements
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../dashboard/shell/shell.component';
import { unique } from '@blockframes/utils/helpers';

type StatementEnhanced = Record<number, (Statement & { rightholderName: string, number: number })[]>;

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
  public filteredRightHolders$ = new BehaviorSubject<(OrgState & { role: RightholderRole[], name: string })[]>([]);
  public statementYears$ = new BehaviorSubject<number[]>([]);
  public groupedStatements$ = new BehaviorSubject<StatementEnhanced>({});
  public rightholders$ = combineLatest([this.shell.rightholderRights$, this.shell.rightholders$]).pipe(
    map(([rights, rightholders]) => rightholders.filter(r => rights.some(right => right.rightholderId === r.id)))
  );
  public roles$ = this.rightholders$.pipe(map(rightholders => unique(rightholders.map(r => r.roles).flat())));
  public sources$ = this.shell.rightholderSources$;

  private subs: Subscription[] = [];

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(this.revenueModeControl.valueChanges.pipe(startWith(this.revenueModeControl.value)).subscribe(mode => {
      this.shell.revenueMode$.next(mode);
    }));
    const statements$ = this.shell.rightholderStatements$.pipe(
      map(statements => statements.filter(s => s.status === 'reported' && (!s.reviewStatus || s.reviewStatus === 'accepted')))
    );
    this.subs.push(statements$.subscribe(statements => {
      const sorted = sortStatements(statements);
      const years = new Set<number>();
      const grouped: StatementEnhanced = {};
      sorted.forEach(statement => {
        const year = statement.duration.to.getFullYear();
        const rightholder = this.shell.waterfall.rightholders.find(r => r.id === statement[rightholderKey(statement.type)]);
        const filteredStatements = filterStatements(statement.type, [statement.senderId, statement.receiverId], statement.contractId, statements);
        const number = getStatementNumber(statement, filteredStatements);
        years.add(year);
        grouped[year] ||= [];
        grouped[year].push({
          ...statement,
          rightholderName: rightholder.name,
          number
        });
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
      this.rightholders$
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
