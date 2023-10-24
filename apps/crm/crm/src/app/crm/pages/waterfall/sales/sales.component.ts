import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SalesMapData } from '@blockframes/waterfall/components/sales-map/sales-map.component';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { Observable, combineLatest, map } from 'rxjs';

@Component({
  selector: 'crm-waterfall-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesComponent {
  
  public data$: Observable<SalesMapData> = combineLatest([
    this.shell.contracts$,
    this.shell.waterfall$,
    this.shell.terms$,
    this.shell.incomes$
  ]).pipe(
    map(([contracts, waterfall, terms, incomes]) => ({ contracts, waterfall, terms, incomes }))
  );

  constructor(private shell: DashboardWaterfallShellComponent) { }

}
