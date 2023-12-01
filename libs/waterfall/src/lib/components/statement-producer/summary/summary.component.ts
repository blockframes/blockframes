import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  Right,
  Statement,
  WaterfallSource,
  getGroup,
  getOrderedRights,
  getSources,
  getStatementRightsToDisplay,
  getStatementSources,
  isVerticalGroup
} from '@blockframes/model';
import { DashboardWaterfallShellComponent } from '../../../dashboard/shell/shell.component';
import { StatementForm } from '../../../form/statement.form';
import { BehaviorSubject, Subscription, combineLatest, debounceTime, map, shareReplay } from 'rxjs';

@Component({
  selector: 'waterfall-statement-producer-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementProducerSummaryComponent implements OnInit, OnDestroy {

  @Input() statement: Statement;
  @Input() form: StatementForm;

  private sub: Subscription;

  public statementsControl = new FormControl<string[]>([]);
  public incomeIds$ = new BehaviorSubject<string[]>([]);

  public sources$ = combineLatest([this.incomeIds$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([incomeIds, incomes, rights, simulation]) => getStatementSources({ ...this.statement, incomeIds }, this.shell.waterfall.sources, incomes, rights, simulation.waterfall.state)),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  public groupsBreakdown$ = combineLatest([this.shell.rights$, this.shell.simulation$, this.sources$]).pipe(
    map(([rights, simulation, sources]) => {

      const displayedRights = getStatementRightsToDisplay(this.statement, rights);
      const orderedRights = getOrderedRights(displayedRights, simulation.waterfall.state);

      const groups: Record<string, { group: Right, rights: Right[], sources: WaterfallSource[] }> = {};
      for (const right of orderedRights) {
        const groupState = getGroup(simulation.waterfall.state, right.id);
        if (groupState && isVerticalGroup(simulation.waterfall.state, groupState)) {
          const group = rights.find(r => r.id === groupState.id);
          if (!groups[group.id]) {
            const sourceIds = getSources(simulation.waterfall.state, group.id).map(i => i.id);
            groups[group.id] = { group, rights: [], sources: sources.filter(s => sourceIds.includes(s.id)) };
          }
          groups[group.id].rights.push(right);
        } else {
          const sourceIds = getSources(simulation.waterfall.state, right.id).map(i => i.id);
          groups[right.id] = { group: right, rights: [right], sources: sources.filter(s => sourceIds.includes(s.id)) };
        }
      }

      return Object.values(groups).filter(g => g.sources.length);
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