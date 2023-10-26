// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Observable, combineLatest, map } from 'rxjs';
import { ApexChart, ApexDataLabels, ApexNonAxisChartSeries, ApexResponsive, ApexTooltip } from 'ng-apexcharts';

// Blockframes
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { mainCurrency, movieCurrencies, titleCase } from '@blockframes/model';
import { sorts } from '@blockframes/ui/list/table/sorts';

type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
};

const responsiveChart: ApexResponsive[] = [
  {
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: "bottom"
      }
    }
  }
];

@Component({
  selector: 'waterfall-title-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {

  private currentRightholder = 'yi40WQqMrgBmbYl7p1mg' // TODO #9519 rf on wrong

  public incomes$ = this.shell.state$.pipe(
    map(state => {
      const incomeStates = Object.values(state.waterfall.state.incomes);
      if (!incomeStates.length) return { [mainCurrency]: 0 };
      const sum = incomeStates.map(a => a.amount).reduce((a, b) => a + b);
      return { [mainCurrency]: sum };
    })
  );

  private rightholderState$ = this.shell.state$.pipe(
    map(state => state.waterfall.state.orgs[this.currentRightholder])
  );

  public turnover$ = this.rightholderState$.pipe(
    map(state => ({ [mainCurrency]: state.turnover.actual }))
  );

  public revenue$ = this.rightholderState$.pipe(
    map(state => ({ [mainCurrency]: state.revenu.actual }))
  );

  private rightholdersRevenue$ = this.shell.state$.pipe(
    map(state => Object.values(state.waterfall.state.orgs)),
    map(orgs => orgs.map(org => ({
      name: this.shell.waterfall.rightholders.find(r => r.id === org.id).name,
      revenue: org.revenu.actual,
    })))
  );

  public rightholdersRevenueChart$: Observable<Partial<ChartOptions>> = this.rightholdersRevenue$.pipe(
    map(rightholders => {
      const series = rightholders.map(r => r.revenue);
      const labels = rightholders.map(r => titleCase(r.name));
      return {
        series,
        labels,
        chart: {
          type: 'pie',
          // width: 380
        },
        responsive: responsiveChart,
        tooltip: {
          y: {
            formatter: (value) => `${Math.round(value)} ${movieCurrencies[mainCurrency]}`
          }
        },
      }
    })
  );

  public rightholdersRevenueSummary$ = combineLatest([this.incomes$, this.shell.state$]).pipe(
    map(([incomes, state]) => {
      const orgs = Object.values(state.waterfall.state.orgs);
      return orgs.map(org => ({
        name: this.shell.waterfall.rightholders.find(r => r.id === org.id).name,
        investment: { [mainCurrency]: org.investment },
        expense: { [mainCurrency]: org.expense },
        turnover: { [mainCurrency]: org.turnover.actual },
        revenue: { [mainCurrency]: org.revenu.actual },
        gross: Math.round(org.revenu.actual / incomes[mainCurrency] * 100),
      }));
    }),
  );

  public sorts = sorts;

  constructor(
    private shell: DashboardWaterfallShellComponent,
  ) {

  }

}
