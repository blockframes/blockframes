import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartOptions, globalOptions } from "./default-chart-options";
import { ChartComponent } from "ng-apexcharts";



@Component({
  selector: 'event-analytics-chart',
  templateUrl: './event-analytics-chart.component.html',
  styleUrls: ['./event-analytics-chart.component.scss']
})
export class EventAnalyticsChartComponent implements OnInit {
  @ViewChild("chart", { static: false }) chart: ChartComponent;

  public chartOptions: Partial<ChartOptions>;
  public data = [];
  public connexionsData = [];
  public screeningsData = [];

  constructor() {
    this.initChart();
   }

  ngOnInit(): void {
    this.screeningsPerWeek();
  }

  initChart(): void {
    this.chartOptions = {
      ...globalOptions,
      series: [{
          name: "Screenings",
          data: this.screeningsData
        }],
      chart: {
        type: "area",
        ...globalOptions.chart,
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'dd/MM',
        }
      },
      yaxis: {
        forceNiceScale: false,
        labels: {
          show: true,
          formatter: function(val)
          { return val + '' },
          style: {
            colors: "",
            fontSize: '12px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 'bold',
            cssClass: 'apexcharts-yaxis-label',
         },
        },
      },
      annotations: {
        yaxis: [
          {
            borderColor: "#999",
            label: {
              text: "Support",
              style: {
                color: "#fff",
                background: "#00E396"
              }
            }
          },
        ]
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return val + " screenings";
          }
        }
      },
      title: {
        text: "Number of screenings per day",
        align: "center",
        floating: true,
        style: {
          fontSize:  '14px',
          fontWeight:  'bold',
          fontFamily:  "undefined",
          color:  'white'
        }
      },
    };
  }

  screeningsPerWeek() {

    // Creation of an empty array
    const allArray = [];
    // Setting up the date between 1 and 30 October from fake data
    const firstDay = new Date('2020-10-01');
    const lastDay = new Date('2020-10-31');
    // Initialize number of users connexion
    let nbScreenings = 0;
    // Loop all users to get all the connexions array data
    this.screenings.map(u => allArray.push(u.start));
    // Flat on the all arrays to get one array with all dates
    const group = allArray.reduce((firstArray, secondArray) => firstArray.concat(secondArray), []);
    // Loop the dates inside the array [connexions] to get the number of connexions users in the same day
    for (const d = firstDay; d <= lastDay; d.setDate(d.getDate() + 1)) {
      nbScreenings = group.filter(date => new Date(date).toDateString() === d.toDateString()).length;

      this.screeningsData.push({x: new Date(d), y: Math.floor(nbScreenings)});
    }
    // Render this function
    return this.screeningsData;
  }



}
