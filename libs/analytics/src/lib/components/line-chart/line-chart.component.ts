import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { format } from 'date-fns'


export interface LineChartData {
  name: string,
  data: { x: number, y: number }[]
}

@Component({
  selector: '[data] analytics-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
  @ViewChild("chart") chart: ChartComponent;

  lineChartOptions = {
    series: [],
    grid: {
      show: true,
      padding: {
        left: 0,
        right: 0
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [10, 90,]
      },
    },
    theme: {
      monochrome: {
        enabled: true,
        color: '#001ec7'
      },
    },
    stroke: {
      curve: "smooth",
      width: 2.5
    },
    markers: {
      size: 0,
      strokeWidth:0,
    },
    chart: {
      width: '100%',
      height: '300px',
      type: "area",
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (value) => value
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        formatter: date => format(date, 'MM-dd-yyyy')
      }

    },
  };



  @Input() set data(data: LineChartData[]) {
    if (!data) return;
    this.lineChartOptions.series = data
    this.chart?.updateOptions(this.lineChartOptions);
  }

  @Input() set filmView(isFilmView: boolean) {
    this.lineChartOptions.xaxis.labels.formatter = (date) => isFilmView ? format(date, 'MMM') : format(date, 'MM-dd-yyyy');
    this.lineChartOptions.stroke.curve = isFilmView ? "straight" : "smooth";
    this.lineChartOptions.markers.size = isFilmView ? 4 : 0;
    this.chart?.updateOptions(this.lineChartOptions);
  }

}
