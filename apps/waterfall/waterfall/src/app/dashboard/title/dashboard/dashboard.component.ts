// Angular
import { Component, ChangeDetectionStrategy, Optional } from '@angular/core';
import { Observable, combineLatest, filter, map, startWith, switchMap, tap } from 'rxjs';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexLegend,
  ApexMarkers,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
  ApexStroke,
  ApexTitleSubtitle,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis
} from 'ng-apexcharts';

// Blockframes
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { OrgState, mainCurrency, movieCurrencies, titleCase, History, sum, PricePerCurrency } from '@blockframes/model';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { FormControl } from '@angular/forms';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationService } from '@blockframes/organization/service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { downloadCsvFromJson } from '@blockframes/utils/helpers';
import { Intercom } from 'ng-intercom';
import { Router } from '@angular/router';

type ChartOptions = {
  series: ApexNonAxisChartSeries | ApexAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: string[];
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis | ApexYAxis[];
  stroke: ApexStroke;
  markers: ApexMarkers;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  fill: ApexFill;
};

interface RevenueSummary {
  name: string;
  investment: PricePerCurrency;
  expense: PricePerCurrency;
  turnover: PricePerCurrency;
  revenue: PricePerCurrency;
  gross: number;
}

@Component({
  selector: 'waterfall-title-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private waterfall = this.shell.waterfall;
  public waterfall$ = this.shell.waterfall$;
  public state$ = this.shell.state$;
  public currentRightholder$ = this.shell.currentRightholder$.pipe(
    tap(rightholder => {
      if (!rightholder && this.waterfall.versions.length > 0) {
        this.snackbar.open($localize`Organization "${this.orgService.org.name}" is not associated to any rightholders.`, this.shell.canBypassRules ? $localize`EDIT RIGHT HOLDERS` : $localize`ASK FOR HELP`, { duration: 5000 })
          .onAction()
          .subscribe(() => {
            if (this.shell.canBypassRules) {
              this.router.navigate(['c/o/dashboard/title', this.shell.waterfall.id, 'right-holders']);
            } else {
              this.intercom.show($localize`My organization "${this.orgService.org.name}" is not associated to any rightholders in the waterfall "${this.shell.movie.title.international}"`);
            }
          });
        return;
      } else {
        this.rightholderControl.setValue(rightholder?.id);
      }
    })
  );
  public sorts = sorts;
  public rightholderControl = new FormControl<string>('');

  public incomes$ = this.state$.pipe(
    map(state => {
      const incomeStates = Object.values(state.waterfall.state.incomes);
      if (!incomeStates.length) return { [mainCurrency]: 0 };
      const sum = incomeStates.map(a => a.amount).reduce((a, b) => a + b);
      return { [mainCurrency]: sum };
    })
  );

  public rightholdersState$: Observable<(OrgState & { name: string, expense: number })[]> = this.state$.pipe(
    map(state => state.waterfall.state),
    map(state => Object.values(state.orgs).map(org => ({
      ...org,
      name: titleCase(this.waterfall.rightholders.find(r => r.id === org.id)?.name),
      expense: sum(Object.values(state.expenses).filter(e => e.orgId === org.id).map(e => e.amount)),
    })))
  );

  private rightholderState$ = combineLatest([this.state$, this.currentRightholder$]).pipe(
    filter(([_, currentRightholder]) => !!currentRightholder),
    map(([state, currentRightholder]) => state.waterfall.state.orgs[currentRightholder.id])
  );

  public turnover$ = this.rightholderState$.pipe(
    map(orgState => ({ [mainCurrency]: orgState?.turnover.actual || 0 }))
  );

  public revenue$ = this.rightholderState$.pipe(
    map(orgState => ({ [mainCurrency]: orgState?.revenu.actual || 0 }))
  );

  private rightholdersRevenue$ = this.rightholdersState$.pipe(
    map(orgs => orgs.map(org => ({
      name: org.name,
      revenue: org.revenu.actual,
    })))
  );

  public rightholdersRevenueChart$: Observable<Partial<ChartOptions>> = this.rightholdersRevenue$.pipe(
    map(rightholders => {
      const series = rightholders.map(r => r.revenue);
      const labels = rightholders.map(r => r.name);
      if (!series.some(s => s !== 0)) return { series: [] };
      return {
        series,
        labels,
        chart: { type: 'pie' },
        responsive: [
          {
            breakpoint: 480,
            options: {
              chart: {
                width: 200
              },
              legend: {
                position: 'bottom'
              }
            }
          }
        ],
        tooltip: { y: { formatter: (value) => `${Math.round(value)} ${movieCurrencies[mainCurrency]}` } },
      }
    })
  );

  public rightholdersROIChart$: Observable<Partial<ChartOptions>> = this.rightholdersState$.pipe(
    map(rightholders => {
      return rightholders.filter(r => r.investment > 0 || r.expense > 0 || r.revenu.actual > 0)
    }),
    map(rightholders => {
      const series = [
        {
          name: $localize`Expenses`,
          data: rightholders.map(r => Math.round(r.expense))
        },
        {
          name: $localize`Investment`,
          data: rightholders.map(r => Math.round(r.investment))
        },
        {
          name: $localize`Net receipts`,
          data: rightholders.map(r => Math.round(r.revenu.actual))
        }
      ];
      if (!series.some(s => s.data.some(d => d !== 0))) return { series: [] };
      return {
        series,
        chart: {
          type: 'bar',
          toolbar: { show: false }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          offsetX: -6,
          style: {
            fontSize: '12px',
            colors: ['#fff']
          }
        },
        stroke: {
          show: true,
          width: 1,
          colors: ['#fff']
        },
        xaxis: {
          categories: rightholders.map(r => r.name)
        },
        tooltip: { y: { formatter: (value) => `${Math.round(value)} ${movieCurrencies[mainCurrency]}` } },
      };
    })
  );

  public netRevenueChart$: Observable<Partial<ChartOptions>> = combineLatest([
    this.currentRightholder$,
    this.rightholderControl.valueChanges.pipe(startWith(''))
  ]).pipe(
    map(([currentRightholder, controlValue]) => controlValue || currentRightholder.id),
    switchMap(rightholderId => this.rightholdersState$.pipe(map(orgs => orgs.find(org => org.id === rightholderId)))),
    switchMap(rightholder => this.state$.pipe(map(state => ({
      rightholder,
      history: state.waterfall.history.filter(h => Object.values(h.incomes).length > 0)
    })))),
    map((data) => {
      if (!data.rightholder) return;
      const lastHistoryPerYear = this.getLastHistoryPerYear(data.history);
      const categories = lastHistoryPerYear.map(h => new Date(h.date).getFullYear());

      let previousRevenue = 0
      const incomes = lastHistoryPerYear.map(h => {
        const revenue = (h.orgs[data.rightholder.id]?.revenu.actual || 0);
        const income = revenue - previousRevenue;
        previousRevenue = revenue;
        return Math.round(income);
      });
      const revenue = lastHistoryPerYear.map(h => Math.round(h.orgs[data.rightholder.id]?.revenu.actual || 0));
      let previousCashflow = 0;
      const cashflow = lastHistoryPerYear.map(h => {
        const turnover = (h.orgs[data.rightholder.id]?.turnover.actual || 0);
        const cashflow = turnover - previousCashflow;
        previousCashflow = turnover;
        return Math.round(cashflow);
      });

      const series = [
        {
          name: $localize`Yearly Net Revenue`,
          type: 'column',
          data: incomes
        },
        {
          name: $localize`Cashflow`,
          type: 'column',
          data: cashflow
        },
        {
          name: $localize`Total Net Revenue`,
          type: 'line',
          data: revenue
        }
      ];
      if (!series.some(s => s.data.some(d => d !== 0))) return { series: [] };
      return {
        series,
        chart: {
          type: 'line',
          stacked: false,
          toolbar: { show: false },
          height: 450
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          width: [1, 1, 4]
        },
        xaxis: {
          categories
        },
        yaxis: [
          {
            seriesName: 'Revenue',
            opposite: true,
            axisTicks: {
              show: true
            },
            axisBorder: {
              show: true
            },
            title: {
              text: movieCurrencies[mainCurrency]
            }
          }
        ],
        tooltip: {
          fixed: {
            enabled: true,
            position: 'topLeft',
            offsetY: 30,
            offsetX: 60
          },
          y: { formatter: (value) => `${Math.round(value / 1000)} K ${movieCurrencies[mainCurrency]}` }
        },
        legend: {
          horizontalAlign: 'left',
          offsetX: 40
        }
      }
    })
  );

  public rightholdersRevenueSummary$: Observable<RevenueSummary[]> = combineLatest([this.incomes$, this.rightholdersState$]).pipe(
    map(([incomes, orgs]) => {
      return orgs.map(org => ({
        name: org.name,
        investment: { [mainCurrency]: org.investment },
        expense: { [mainCurrency]: org.expense },
        turnover: { [mainCurrency]: org.turnover.actual },
        revenue: { [mainCurrency]: org.revenu.actual },
        gross: Math.round(org.revenu.actual / incomes[mainCurrency] * 100),
      }));
    }),
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    private snackbar: MatSnackBar,
    private router: Router,
    @Optional() private intercom: Intercom,
  ) {
    this.shell.setDate(undefined);
    this.dynTitle.setPageTitle(this.shell.movie.title.international, $localize`Waterfall Dashboard`);
  }

  private getLastHistoryPerYear(history: History[]) {
    const firstYear = new Date(history[0] ? history[0].date : new Date().getFullYear() - 1).getFullYear();
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - firstYear + 1 }, (_, i) => firstYear + i);
    const historyPerYear = years.map(year => history.filter(h => new Date(h.date).getFullYear() === year));
    return historyPerYear.filter(h => h.length).map(h => h.pop());
  }

  public downloadCsv(rows: RevenueSummary[]) {
    const exportedRows = rows.map(r => ({
      'Right Holder Name': r.name,
      'Investment': `${r.investment[mainCurrency]} ${movieCurrencies[mainCurrency]}`,
      'Expenses': `${r.expense[mainCurrency]} ${movieCurrencies[mainCurrency]}`,
      'Cash Flow': `${r.turnover[mainCurrency]} ${movieCurrencies[mainCurrency]}`,
      'Net Revenue': `${r.revenue[mainCurrency]} ${movieCurrencies[mainCurrency]}`,
      '% Gross': `${r.gross} %`
    }));

    const filename = `${this.shell.movie.title.international.split(' ').join('_')}_revenue_summary`;
    downloadCsvFromJson(exportedRows, filename);
  }

}
