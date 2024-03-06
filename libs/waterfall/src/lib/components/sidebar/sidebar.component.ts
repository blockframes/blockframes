
import { FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription, combineLatest, startWith } from 'rxjs';
import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';

import { OrgState, RightholderRole, Statement, rightholderRoles } from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';


@Component({
  selector: 'waterfall-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallSidebarComponent implements OnInit, OnDestroy {

  totalToDate = new FormControl(false);
  
  selectedStatement = new FormControl<Statement | undefined>(undefined);
  
  highlightedRightHolder = new FormControl<string[]>([]);
  hiddenRightHolder = new FormControl<string[]>([]);
  highlightedSource = new FormControl<string[]>([]);
  
  roles = Object.entries(rightholderRoles);
  rightHolderFilter = new FormControl<RightholderRole[]>([]);
  filteredRightHolders$ = new BehaviorSubject<(OrgState & { role: RightholderRole[], name: string })[]>([]);

  statementYears$ = new BehaviorSubject<number[]>([]);
  groupedStatements$ = new BehaviorSubject<Record<number, Statement[]>>({});

  subs: Subscription[] = [];

  constructor(
    public shell: DashboardWaterfallShellComponent,
  ) { }

  ngOnInit() {
    this.subs.push(this.totalToDate.valueChanges.subscribe(totalToDate => {
      this.shell.isCalculatedRevenue$.next(totalToDate);
    }));
    this.subs.push(this.shell.statements$.subscribe(statements => {
      const sorted = statements.sort((a, b) =>  b.duration.from.getTime() - a.duration.from.getTime());
      const years = new Set<number>();
      const grouped: Record<number, Statement[]> = {};
      sorted.forEach(statement => {
        const year = statement.duration.from.getFullYear();
        years.add(year);
        grouped[year] ||= [];
        grouped[year].push(statement);
      });
      this.groupedStatements$.next(grouped);
      this.statementYears$.next([...years].sort((a, b) => b - a));
    }));
    this.subs.push(this.selectedStatement.valueChanges.subscribe(statement => {
      this.shell.setDate(statement.duration.to);
    }));
    this.subs.push(this.highlightedRightHolder.valueChanges.subscribe(rightHolderIds => {
      this.shell.highlightedRightHolderIds$.next(rightHolderIds);
    }));
    this.subs.push(this.hiddenRightHolder.valueChanges.subscribe(rightHolderIds => {
      this.shell.hiddenRightHolderIds$.next(rightHolderIds);
    }));
    this.subs.push(this.highlightedSource.valueChanges.subscribe(sourceIds => {
      this.shell.highlightedSourceIds$.next(sourceIds);
    }));
    this.subs.push(combineLatest([
      this.shell.state$,
      this.rightHolderFilter.valueChanges.pipe(startWith([])),
      this.shell.isCalculatedRevenue$,
    ]).subscribe(([ state, rightHolderFilter, isCalculatedRevenue ]) => {
      const filtered = Object.values(state.waterfall.state.orgs).map(org => {
        const rightHolder = this.shell.waterfall.rightholders.find(r => r.id === org.id);
        return { ...org, name: rightHolder.name, role: rightHolder.roles, revenue: org.revenu[isCalculatedRevenue ? 'calculated' : 'actual'] };
      }).filter(org => rightHolderFilter.length === 0 || rightHolderFilter.some(r => org.role.includes(r)));
      this.filteredRightHolders$.next(filtered);
    }));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }
}
