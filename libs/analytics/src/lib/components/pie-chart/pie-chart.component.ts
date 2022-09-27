import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AnalyticData } from '@blockframes/model';

import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexTheme,
  ChartComponent,
} from 'ng-apexcharts';

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
  isLoading = true;

  pieChartOptions: Partial<PieChartOptions> = {
    series: [],
    labels: [],
    chart: {
      width: '100%',
      type: 'pie',
      events: {
        dataPointSelection: (event, chartContext, config) => {
          const label = config.w.config.labels[config.dataPointIndex];
          const value = this.previousSelection === label ? '' : label;
          this.selection.next(value);
          this.previousSelection = value;
        }
      }
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
    this.isLoading = false;

    this.pieChartOptions.labels = Object.values(data).map(d => d.label);
    this.pieChartOptions.series = Object.values(data).map(d => d.count);

    this.chart?.updateOptions(this.pieChartOptions);
  }

  previousSelection?: string;
  @Output() selection: EventEmitter<string> = new EventEmitter();

  toggleSelect() {
    const index = this.pieChartOptions.labels.findIndex(label => label === this.previousSelection);
    if (index !== -1) this.chart.toggleDataPointSelection(index);
  }
}
