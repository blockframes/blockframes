import { ChangeDetectionStrategy, Component, Input, OnDestroy, ViewChild } from "@angular/core";
import { Analytics, EventName } from "@blockframes/model";
import { ThemeService } from "@blockframes/ui/theme";
import { eachDayOfInterval, isSameDay } from "date-fns";
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
} from "ng-apexcharts";

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

@Component({
  selector: '[data][eventNames] analytics-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LineChartComponent implements OnDestroy {
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
        color: '#3c64f7'
      }
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
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

  @Input() eventNames: EventName[] = [];
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

    this.lineChartOptions.series = [];
    for (const name of this.eventNames) {
      const data = eachDay.map(day => {
        const analyticsOfDay = analytics
          .filter(analytic => analytic.name === name)
          .filter(analytic => isSameDay(day, analytic._meta.createdAt)
        );

        return [day.getTime(), analyticsOfDay.length] as [number, number];
      });

      this.lineChartOptions.series.push({ name: eventNameLabel[name], data });
    }

    this.chart?.updateOptions(this.lineChartOptions);
  }

  private sub = this.theme.theme$.subscribe(theme => {
    this.lineChartOptions.chart.foreColor = theme === 'dark' ? '#f9f8ff' : '#080b0f';
    this.chart?.updateOptions(this.lineChartOptions);
  });

  constructor(private theme: ThemeService) {}

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
