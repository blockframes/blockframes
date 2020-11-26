import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { lineChartOptions } from '@blockframes/ui/charts/default-chart-options';

export interface ChartInfo {
  title: string,
  eventName: string,
  icon: string
}

@Component({
  selector: 'line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
  })
export class LineChartComponent {

  public lineChartOptions;
  public chartData: any[] = [];
  @Input() chartInfo: ChartInfo;

  constructor() {
    this.lineChartOptions = lineChartOptions;
  }

  getLineChartSeries(chartInfo: ChartInfo) {
    const hits = this.chartData.find(chart => chart.eventName === chartInfo.eventName).y
    return [{
      name: chartInfo.title,
      data: hits
    }];
  }

  getLineChartXaxis(chartInfo: ChartInfo) {
    return {
      categories: this.chartData.find(chart => chart.eventName === chartInfo.eventName).x,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    };
  }
}
