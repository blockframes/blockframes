import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
  ApexPlotOptions,
  ApexYAxis,
  ApexTooltip,
  ApexFill,
  ApexLegend
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  tooltip: ApexTooltip;
  fill: ApexFill;
  legend: ApexLegend;
};

export const lineChartOptions: Partial<ChartOptions> = {
  chart: {
    height: 100,
    type: "area",
    zoom: {
      enabled: false
    },
    toolbar: {
      show: false
    }
  },
  dataLabels: {
    enabled: false
  },
  fill: {
    gradient: {}
  },
  stroke: {
    curve: "smooth",
    width: 2.5
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0
    }
  },
  yaxis: {
    labels: {
      show: false,
    }
  }
};