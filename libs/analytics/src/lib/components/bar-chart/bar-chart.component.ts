import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { AnalyticData } from '@blockframes/model';
import { trimString } from '@blockframes/model';

import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexTheme,
  ChartComponent,
  ApexTooltip,
  ApexLegend,
  ApexYAxis
} from 'ng-apexcharts';

interface BarChartOptions {
  series: ApexAxisChartSeries;
  labels: string[];
  chart: ApexChart;
  theme: ApexTheme;
  dataLabels: ApexDataLabels;
  yaxis: ApexYAxis;
  tooltip: ApexTooltip;
  legend: ApexLegend;
}

@Component({
  selector: 'analytics-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'surface' }
})
export class BarChartComponent {
  @ViewChild("chart") chart: ChartComponent
  isLoading = true;

  barChartOptions: Partial<BarChartOptions> = {
    series: [],
    labels: [],
    chart: {
      width: '100%',
      height: '300px',
      type: 'bar',
      toolbar: {
        show: false
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        color: '#001ec7'
      },
    },
    dataLabels: {
      enabled: false
    },
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(0)
      }
    },
    tooltip: {
      y: {
        title: {
          formatter: () => '# Interactions:'
        }
      }
    }
  }

  @Input() set data(analytics: AnalyticData[]) {
    if (!analytics) return;
    this.isLoading = false;
    if (!analytics.some(a => a.count > 0)) return;

    const data = Object.values(analytics).map(d => d.count);
    this.barChartOptions.series = data.length ? [{ data }] : [];
    this.barChartOptions.labels = Object.values(analytics).map(d => trimString(d.label, 16));

    this.chart?.updateOptions(this.barChartOptions);
  }

}
