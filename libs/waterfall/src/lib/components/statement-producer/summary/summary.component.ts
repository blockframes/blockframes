import { Component, ChangeDetectionStrategy, Input, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Statement, getStatementSources } from '@blockframes/model';
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