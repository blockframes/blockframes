import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import {
  ApexChart,
  ApexDataLabels,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexTheme,
  ChartComponent
} from "ng-apexcharts";

interface PieChartOptions {
  series: ApexNonAxisChartSeries;
  labels: string[];
  chart: ApexChart;
  theme: ApexTheme;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
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
        color: '#2a3052'
      },
    },
    stroke: {
      show: false
    }
  };

  @Input() set data(data: Record<string, number>) {
    if (!data) return;
    this.pieChartOptions.labels = Object.keys(data);
    this.pieChartOptions.series = Object.values(data);

    this.chart?.updateOptions(this.pieChartOptions);
  }

}