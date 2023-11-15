import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { createIncome } from '@blockframes/model';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { combineLatest, map, pluck } from 'rxjs';

@Component({
  selector: 'waterfall-statement-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatementViewComponent {

  public statement$ = combineLatest([this.route.params.pipe(pluck('statementId')), this.shell.statements$]).pipe(
    map(([statementId, statements]) => statements.find(s => s.id === statementId)),
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
  ) {
    this.shell.setDate(undefined); // TODO #9485 use statement date to fetch enabled rights (new Date('12/31/2013'))
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'View Statement');
    this.shell.simulateWaterfall();
  }


  public async testSimulation() {

    this.shell.simulateWaterfall({ incomes: [createIncome({ medias: ['theatrical'], price: 1000000, currency: 'EUR', contractId: 'playtime_rf', id:'incometest', territories: ['france'], date: new Date()})]})

  }


}