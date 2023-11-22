import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createIncome, getStatementSources } from '@blockframes/model';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { StatementForm } from '@blockframes/waterfall/form/statement.form';
import { combineLatest, map, pluck, tap } from 'rxjs';

@Component({
  selector: 'waterfall-statement-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementEditComponent {

  public statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
    tap(statement => this.shell.setDate(statement.duration.to)),
    tap(statement => this.form.patchValue(statement))
  );

  public sources$ = combineLatest([this.statement$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([statement, incomes, rights, simulation]) => getStatementSources(statement, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
  );

  public waterfall = this.shell.waterfall;

  public form: StatementForm;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Edit Statement');
    this.shell.simulateWaterfall();

    this.form = new StatementForm();
  }


  public async testSimulation() {

    this.shell.simulateWaterfall({ incomes: [createIncome({ medias: ['theatrical'], price: 1000000, currency: 'EUR', contractId: 'playtime_rf', id: 'incometest', territories: ['france'], date: new Date() })] })

  }


}