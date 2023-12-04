import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Right,
  Statement,
  TitleState,
  WaterfallSource,
  generatePayments,
  getAssociatedRights,
  getAssociatedSource,
  getChildRights,
  getGroup,
  getOrderedRights,
  getPath,
  getPathDetails,
  getSources,
  getStatementRights,
  getStatementRightsToDisplay,
  getStatementSources,
  getTransferDetails,
  isSource,
  isVerticalGroup
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { BehaviorSubject, Subscription, combineLatest, debounceTime, map, shareReplay } from 'rxjs';
import { unique } from '@blockframes/utils/helpers';

function getSourcesWithRemainsOf(incomeIds: string[], state: TitleState, rightId: string, sources: WaterfallSource[]): (WaterfallSource & { taken: number })[] {
  const sourceIds = getSources(state, rightId).map(i => i.id);

  return sources.filter(s => sourceIds.includes(s.id)).map(s => {
    const path = getPath(rightId, s.id, state);

    // We want the value of the transfer that is just before the current right or group
    const from = path[path.indexOf(rightId) - 2];
    const to = path[path.indexOf(rightId) - 1];

    const details = getTransferDetails(incomeIds, s.id, from, to, state);
    return { ...s, taken: details.taken };
  });
}

function getRightTaken(rights: Right[], incomeIds: string[], state: TitleState, rightId: string, sources: WaterfallSource[]): Row {
  const right = rights.find(r => r.id === rightId);
  const sourceIds = getSources(state, rightId).map(i => i.id);

  const details = sources.filter(s => sourceIds.includes(s.id)).map(s => {
    const path = getPath(rightId, s.id, state);

    const to = path[path.length - 1];
    const from = path[path.indexOf(to) - 1];
    return getTransferDetails(incomeIds, s.id, from, to, state);
  });

  const takenSum = details.reduce((acc, s) => acc + s.taken, 0);
  return { name: right.name, percent: details[0]?.percent || 0, taken: takenSum, type: 'right' };
}

interface Row {
  name: string;
  percent?: number;
  taken: number;
  type?: 'source' | 'total' | 'right';
  right?: Right;
  source?: WaterfallSource & { taken: number };
}

@Component({
  selector: 'waterfall-statement-producer-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementProducerSummaryComponent implements OnInit, OnDestroy {

  @Input() public statement: Statement;
  @Input() form: StatementForm;

  private sub: Subscription;

  public statementsControl = new FormControl<string[]>([]);
  public incomeIds$ = new BehaviorSubject<string[]>([]);

  public sources$ = combineLatest([this.incomeIds$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([incomeIds, incomes, rights, simulation]) => getStatementSources({ ...this.statement, incomeIds }, this.shell.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private statement$ = combineLatest([
    this.incomeIds$, this.sources$, this.shell.incomes$,
    this.shell.rights$, this.shell.simulation$
  ]).pipe(
    map(([incomeIds, sources, _incomes, _rights, simulation]) => {

      // Update statement incomeIds given the selected incoming distibutor or direct sales statements
      const incomes = incomeIds
        .map(id => _incomes.find(i => i.id === id))
        .filter(i => sources.map(s => s.id).includes(getAssociatedSource(i, this.shell.waterfall.sources).id));

      this.statement.incomeIds = incomes.map(i => i.id);

      // Reset payments
      this.statement.payments.right = [];
      delete this.statement.payments.rightholder;

      const statementRights = getStatementRights(this.statement, _rights);
      const rightIds = unique(sources.map(s => getAssociatedRights(s.id, statementRights, simulation.waterfall.state)).flat().map(r => r.id));
      const rights = statementRights.filter(r => rightIds.includes(r.id));

      const statement = generatePayments(this.statement, simulation.waterfall.state, rights, incomes, sources);
      this.form.setAllValue({ ...statement, incomes, sources });
      return statement;
    })
  );

  public groupsBreakdown$ = combineLatest([this.statement$, this.shell.rights$, this.shell.simulation$, this.sources$]).pipe(
    map(([statement, rights, simulation, sources]) => {

      const displayedRights = getStatementRightsToDisplay(statement, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);

      const groups: Record<string, { group: Right, rights: Right[], rows: Row[] }> = {};
      for (const right of orderedRights) {
        const groupState = getGroup(simulation.waterfall.state, right.id);
        if (groupState && isVerticalGroup(simulation.waterfall.state, groupState)) {
          const group = rights.find(r => r.id === groupState.id);
          if (!groups[group.id]) {
            // Sources remains 
            const rows: Row[] = getSourcesWithRemainsOf(statement.incomeIds, simulation.waterfall.state, group.id, sources)
              .map(source => ({ name: source.name, taken: source.taken, type: 'source', source, right: group }));

            const remainTotal = rows.reduce((acc, s) => acc + s.taken, 0);

            // Total
            rows.push({ name: 'TOTAL', taken: remainTotal, type: 'total' });

            // Rights details
            const childs = getChildRights(simulation.waterfall.state, groupState); // All ChildRights are from the same org
            for (const child of childs) {
              const row = getRightTaken(rights, statement.incomeIds, simulation.waterfall.state, child.id, sources);
              rows.push(row);
            }

            groups[group.id] = { group, rights: [], rows };
          }
          groups[group.id].rights.push(right);
        } else {
          // Sources remains 
          const rows: Row[] = getSourcesWithRemainsOf(statement.incomeIds, simulation.waterfall.state, right.id, sources)
            .map(source => ({ name: source.name, taken: source.taken, type: 'source', source, right }));

          const remainTotal = rows.reduce((acc, s) => acc + s.taken, 0);

          // Total
          rows.push({ name: 'TOTAL', taken: remainTotal, type: 'total' });

          // Right details
          const row = getRightTaken(rights, statement.incomeIds, simulation.waterfall.state, right.id, sources);
          rows.push(row);

          groups[right.id] = { group: right, rights: [right], rows };
        }
      }

      return Object.values(groups).filter(g => g.rows.filter(r => r.type === 'source').length);
    })
  );

  public details$ = combineLatest([
    this.groupsBreakdown$, this.shell.simulation$,
    this.statement$, this.shell.rights$
  ]).pipe(
    map(([groups, simulation, statement, rights]) => {
      const sourcesDetails = groups.map(g => g.rows.filter(r => r.type === 'source')).flat();

      return sourcesDetails.map(row => {
        const source = this.shell.waterfall.sources.find(s => s.id === row.source.id);
        const path = getPath(row.right.id, row.source.id, simulation.waterfall.state);

        const rightId = path[path.indexOf(row.right.id) - 1];
        const details = getPathDetails(statement.incomeIds, rightId, row.source.id, simulation.waterfall.state);
        return {
          name: source.name,
          details: details.map(d => ({
            ...d,
            from: isSource(simulation.waterfall.state, d.from) ? this.shell.waterfall.sources.find(s => s.id === d.from.id).name : rights.find(r => r.id === d.from.id).name,
            to: rights.find(r => r.id === d.to.id).name
          }))
        }
      });
    })
  );

  constructor(private shell: DashboardWaterfallShellComponent) { }

  ngOnInit() {
    this.form.setAllValue(this.statement);

    this.incomeIds$.next(this.statement.incomeIds);

    this.sub = this.form.get('duration').get('to').valueChanges.pipe(debounceTime(500)).subscribe(date => {
      const control = this.form.get('duration').get('to');
      const inError = control.hasError('startOverEnd') || control.hasError('isBefore');
      if (!inError && this.shell.setDate(date)) this.shell.simulateWaterfall();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }
}