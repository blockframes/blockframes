import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import { AnalyticData } from "@blockframes/analytics/+state/utils";
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexTheme,
  ChartComponent,
} from "ng-apexcharts";

interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  labels: string[];
  chart: ApexChart;
  theme: ApexTheme;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
  legend: ApexLegend
};

@Component({
  selector: '[data] analytics-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieChartComponent {
  @ViewChild("chart") chart: ChartComponent;

  pieChartOptions: Partial<PieChartOptions> = {
    series: [],
    labels: [],
    chart: {
      width: '100%',
      type: 'pie'
    },
    dataLabels: {
      formatter: (value, { seriesIndex, w }) => {
        return `${w.config.labels[seriesIndex]} (${w.config.series[seriesIndex]})`
      }
    },
    theme: {
      monochrome: {
        enabled: true,
        color: '#001ec7'
      },
    },
    stroke: {
      show: false
    },
    legend: {
      show: false
    }
  };

  @Input() set data(data: AnalyticData[]) {
    if (!data) return;

    this.pieChartOptions.labels = Object.values(data).map(d => d.label);
    this.pieChartOptions.series = Object.values(data).map(d => d.count);

    this.chart?.updateOptions(this.pieChartOptions);
  }

}
