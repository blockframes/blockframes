import { ChangeDetectionStrategy, Component, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { Analytics, EventName } from "@blockframes/model";
import {
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  format,
  isSameDay,
  isSameMonth,
  isSameWeek,
  differenceInMonths
} from "date-fns";
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexLegend,
  ApexMarkers,
  ApexStroke,
  ApexTheme,
  ApexXAxis,
  ApexYAxis,
  ChartComponent,
} from "ng-apexcharts";

interface LineChartOptions {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  theme: ApexTheme;
  legend: ApexLegend;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  markers: ApexMarkers;
};

const eventNameLabel: Record<EventName, string> = {
  addedToWishlist: 'Added to Wishlist',
  askingPriceRequested: 'Asking Price Requested',
  pageView: 'Page Views',
  promoElementOpened: 'Promotional Element opened',
  promoReelOpened: 'Promoreel Opened',
  removedFromWishlist: 'Removed from Wishlist',
  screeningRequested: 'Screening Requested'
}

type Period = 'day' | 'week' | 'month';

const dateFunctions: Record<Period, Record<'interval' | 'isSame', any>> = {
  day: { interval: eachDayOfInterval, isSame: isSameDay },
  week: { interval: eachWeekOfInterval, isSame: isSameWeek },
  month: { interval: eachMonthOfInterval, isSame: isSameMonth }
};

@Component({
  selector: '[data][eventNames] analytics-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class LineChartComponent {
  @ViewChild("chart") chart: ChartComponent;
  isLoading = true;

  period?: Period;
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
        color: '#3c64f7'
      }
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      position: 'bottom',
      horizontalAlign: 'left',
      offsetY: 8
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
    yaxis: {
      labels: {
        formatter: (value) => value.toFixed(0)
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        formatter: (value: string, timestamp: number) => {
          return this.period === 'month'
            ? format(timestamp, "MMM yyy")
            : format(timestamp, 'dd MMM yyyy')
        }
      }
    },
    markers: {
      size: 3
    }
  };

  @Input() eventNames: EventName[] = [];
  private analytics?: Analytics[];
  @Input() set data(data: Analytics[]) {
    if (!data?.length) {
      this.chart?.updateSeries([]);
      this.isLoading = false;
      return;
    }

    const analytics = data.sort((a, b) => a._meta.createdAt.getTime() - b._meta.createdAt.getTime());
    this.analytics = analytics;

    const first = analytics[0]._meta.createdAt;
    const difference = differenceInMonths(new Date(), first);
    if (difference >= 9) {
      this.period = 'month';
    } else if (difference >= 2) {
      this.period = 'week';
    } else {
      this.period = 'day';
    }

    this.updateChart(data);
  }

  changePeriod(period: Period) {
    this.period = period;
    this.updateChart(this.analytics);
  }

  private updateChart(analytics: Analytics[]) {
    const start = analytics[0]._meta.createdAt;
    const end = new Date();
    const { interval, isSame } = dateFunctions[this.period];

    const eachUnit = interval({ start, end });

    this.lineChartOptions.series = [];
    for (const name of this.eventNames) {
      const data = eachUnit.map(unit => {
        const analyticsOfUnit = analytics
          .filter(analytic => analytic.name === name)
          .filter(analytic => isSame(unit, analytic._meta.createdAt)
        );

        return [unit.getTime(), analyticsOfUnit.length] as [number, number];
      });

      this.lineChartOptions.series.push({ name: eventNameLabel[name], data });
    }

    this.chart?.updateOptions(this.lineChartOptions);
    this.isLoading = false;
  }
}
