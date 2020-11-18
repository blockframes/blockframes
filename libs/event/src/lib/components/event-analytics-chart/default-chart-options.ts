import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexLegend,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexMarkers,
  ApexTitleSubtitle,
  ApexAnnotations,
  ApexStroke
} from "ng-apexcharts";

export interface ChartOptions {
  series: ApexAxisChartSeries,
  chart: Partial<ApexChart>,
  dataLabels: ApexDataLabels,
  plotOptions: ApexPlotOptions,
  yaxis: ApexYAxis,
  xaxis: ApexXAxis,
  fill: ApexFill,
  tooltip: ApexTooltip,
  legend: ApexLegend,
  markers: ApexMarkers,
  title: ApexTitleSubtitle,
  annotations: ApexAnnotations,
  stroke: ApexStroke
};

export const globalOptions: Partial<ChartOptions> = {
  dataLabels: {
    enabled: false,
  },
  chart:{
    toolbar:{
      show: false,
      tools:{
        zoom: false
      }
    },
    height: 350,
    width: 950,
  },
  stroke: {
    show: true,
    curve: 'smooth',
    lineCap: 'butt',
    colors: ["green"],
    width: 2,
    dashArray: 0,
},
}
