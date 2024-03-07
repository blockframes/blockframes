import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Term, WaterfallSale, isWaterfallSale } from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { SalesMapData } from '@blockframes/waterfall/components/sales/sales-map/sales-map.component';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'waterfall-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {

  public sales$ = this.shell.contractsAndTerms$.pipe(
    map(contracts => contracts.filter(isWaterfallSale) as (WaterfallSale & { terms: Term[] })[])
  );

  public data$: Observable<SalesMapData> = combineLatest([
    this.sales$,
    this.shell.waterfall$,
    this.shell.terms$,
    this.shell.incomes$
  ]).pipe(
    map(([sales, waterfall, terms, incomes]) => ({ sales, waterfall, terms, incomes }))
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'World Sales');
  }
}
