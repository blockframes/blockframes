import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { Analytics, EventName } from '@blockframes/shared/model';
import { eachDayOfInterval, isSameDay } from 'date-fns';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexStroke,
  ApexTheme,
  ApexXAxis,
  ChartComponent,
} from 'ng-apexcharts';

interface LineChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  theme: ApexTheme;
  legend: ApexLegend;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
};

const eventNameLabel: Record<EventName, string> = {
  addedToWishlist: 'Added to Wishlist',
  askingPriceRequested: 'Asking Price Requested',
  pageView: 'Page Views',
  promoReelOpened: 'Promoreel Opened',
  removedFromWishlist: 'Removed from Wishlist',
  screeningRequested: 'Screening Requested'
}


const getUniqueEventNames = (analytics: Analytics[]) => {
  const names = analytics.map(analytic => analytic.name);
  return Array.from(new Set(names));
}

@Component({
  selector: '[data] analytics-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent {
  @ViewChild("chart") chart: ChartComponent;

  lineChartOptions: LineChartOptions = {
    series: [],
    chart: {
      width: '100%',
      height: '300px',
      type: "area",
    },
    theme: {
      monochrome: {
        enabled: true,
        color: '#001ec7'
      }
    },
    legend: {
      show: true,
      position: 'top',
      showForSingleSeries: true
    },
    grid: {
      show: true,
      padding: {
        left: 0,
        right: 0
      }
    },
    stroke: {
      curve: "smooth",
      width: 2.5
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      type: 'datetime',
    }
  };

  @Input() set data(data: Analytics[]) {
    if (!data) return;
    if (!data.length) {
      this.chart?.updateSeries([]);
      return;
    }

    const analytics = data.sort((a, b) => a._meta.createdAt.getTime() - b._meta.createdAt.getTime());
    const start = analytics[0]._meta.createdAt;
    const end = new Date();
    const eachDay = eachDayOfInterval({ start, end });

    const series: ApexAxisChartSeries = [];
    const eventNames = getUniqueEventNames(analytics);
    for (const name of eventNames) {
      const data = eachDay.map(day => {
        const analyticsOfDay = analytics
          .filter(analytic => analytic.name === name)
          .filter(analytic => isSameDay(day, analytic._meta.createdAt)
        );

        return [day.getTime(), analyticsOfDay.length] as [number, number];
      });

      series.push({ name: eventNameLabel[name], data });
    }

    this.chart?.updateSeries(series);
  }
}
