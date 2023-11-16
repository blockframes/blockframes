import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createIncome, getStatementSources } from '@blockframes/model';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { combineLatest, map, pluck } from 'rxjs';

@Component({
  selector: 'waterfall-statement-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementEditComponent {

  public statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
  );

  public sources$ = combineLatest([this.statement$, this.shell.incomes$, this.shell.rights$, this.shell.simulation$]).pipe(
    map(([statement, incomes, rights, simulation]) => getStatementSources(statement, this.waterfall.sources, incomes, rights, simulation.waterfall.state)),
  );

  public waterfall = this.shell.waterfall;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.shell.setDate(undefined); // TODO #9524 #9525 #9532 #9531 use statement date from form to fetch enabled rights (new Date('12/31/2013'))
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Edit Statement');
    this.shell.simulateWaterfall();
  }


  public async testSimulation() {

    this.shell.simulateWaterfall({ incomes: [createIncome({ medias: ['theatrical'], price: 1000000, currency: 'EUR', contractId: 'playtime_rf', id:'incometest', territories: ['france'], date: new Date()})]})

  }


}