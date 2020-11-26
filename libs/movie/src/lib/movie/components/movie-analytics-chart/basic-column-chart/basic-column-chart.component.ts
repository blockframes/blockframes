import { Component, ViewChild, OnInit, ChangeDetectionStrategy } from "@angular/core";
import { ChartComponent } from "ng-apexcharts";
import { columnChartOptions } from '../default-chart-options';

@Component({
  selector: 'movie-basic-column-chart',
  templateUrl: './basic-column-chart.component.html',
  styleUrls: ['./basic-column-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})

export class BasicColumnChartComponent  {
  @ViewChild("chart", { static: false }) chart: ChartComponent;
  public columnChartOptions;



//   constructor() {
//     this.columnChartOptions = {
//       ...columnChartOptions,
//       series: [{
//         name: "Screenings",
//         data: this.screeningsData
//       }],
//       title: {
//         text: "Number of screenings per week",
//         align: "center",
//         floating: true,
//         style: {
//           fontSize:  '14px',
//           fontWeight:  'bold',
//           fontFamily:  undefined,
//           color:  'white'
//         }
//       },
//       chart: {
//         type: "bar",

//         ...columnChartOptions.chart,
//       },
//       xaxis: {
//         labels: {
//           show: true,
//           rotate: -20,
//           rotateAlways: true,
//           datetimeFormatter:{
//             day: 'dd MMM',
//           },
//           offsetY: 10
//         },
//         offsetX: 15,
//         title:{
//           text: "Weeks",
//           offsetX: -40
//         }
//       },
//       yaxis: {
//         title: {
//           text: "Screenings number"
//         }
//       },
//       plotOptions: {
//         bar: {
//           horizontal: false,
//           columnWidth: "55%",
//           startingShape: "flat",
//           endingShape: "flat"
//         }
//       },
//       tooltip: {
//         y: {
//           formatter: function(val) {
//             return val + " screenings";
//           }
//         }
//       }
//     };
//    }




}
