import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieAnalytics } from './movie-analytics.model';
import { lineChartOptions } from './default-chart-options';

const chartInfo = [
  {
    eventName: 'movieViews',
    title: 'Page views',
    icon: 'visibility',
    image: 'no_views.svg'
  },
  {
    eventName: 'addedToWishlist',
    title: 'Adds to Wishlist',
    icon: 'mouse_pointer',
    image: 'no_wishlist.svg'
  },
  {
    eventName: 'promoReelOpened',
    title: 'Clicks on promo elements',
    icon: 'specific_delivery_list',
    image: 'no_stats_promo.svg'
  }
] as const;

type MovieAnalyticsEventName = typeof chartInfo[number]['eventName']
type MovieAnalyticsTitle = typeof chartInfo[number]['title']

function getSum(array: number[]): number {
  return array.reduce((acc, num) => acc + num, 0);
}

/** Generate each past date for chart's x axis, number means how far from today's date */
function getLastDays(from: number, to: number = 0) {
  if (from < to) {
    throw new Error('from should be larger than to')
  } else {
    return Array(from - to).fill(null).map((_, i) => {
      const today = new Date();
      const time = (new Date()).setDate(today.getDate() - (i + to));
      return new Date(time);
    }).reverse()
  }
}

/** Format date: Date -> YYYYMMDD */
function toYMD(date: Date) {
  const m = date.getMonth()
  const d = date.getDate()
  return `${date.getFullYear()}${m < 10 ? `0${m + 1}` : m + 1}${d < 10 ? `0${d}` : d}`;
}

@Component({
  selector: '[analyticsData] movie-analytics-chart',
  templateUrl: './movie-analytics-chart.component.html',
  styleUrls: ['./movie-analytics-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieAnalyticsChartComponent {
  public lineChartOptions = lineChartOptions;
  public chartInfo = chartInfo;
  public filteredEvent;
  public chartData: any[] = [];


  @Input() set analyticsData(data: MovieAnalytics[]) {
    if (data) {
      data = data.filter(d => !!d);
      if (!data.length) {
        this.chartData = chartInfo.map(chart => chart);
      } else {
        this.chartData = chartInfo.map(chart => {
          const current = this.getXY(data, chart.eventName, 'current');
          const past = this.getXY(data, chart.eventName, 'past');
          const percentage = this.calculatePercentage(current.y, past.y);
          return {
            ...chart,
            x: current.x.map(date => date.toLocaleDateString('en-US')),
            y: current.y,
            percentage
          }
        })
      }
    }
  };

  // get date by period for x, get sum of hits each day by event for y
  getXY(data: MovieAnalytics[], eventName: MovieAnalyticsEventName, period: 'current' | 'past') {
    const x = period === 'current' ? getLastDays(28) : getLastDays(56, 28);
    const y: number[] = [];
    for (const date of x.map(toYMD)) {
      let sum = 0;
      for (const movieAnalytic of data) {
        const event = movieAnalytic[eventName][period].find(e => e.event_date === date);
        sum += event ? event.hits : 0;
      }
      y.push(sum);
    }
    return { x, y }
  }

  getLineChartSeries(eventName: MovieAnalyticsEventName, title: MovieAnalyticsTitle) {
    const hits = this.chartData.find(chart => chart.eventName === eventName).y
    return [{
      name: title,
      data: hits
    }];
  }

  getLineChartXaxis(eventName: MovieAnalyticsEventName) {
    return {
      categories: this.chartData.find(chart => chart.eventName === eventName).x,
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    };
  }

  totalHitsOnCurrentMonth(eventName: MovieAnalyticsEventName) {
    const total = this.chartData.find(chart => chart.eventName === eventName).y;
    if (total) {
      return getSum(total);
    }
  }

  calculatePercentage(currentHits: number[], pastHits: number[]): number {
    const current = getSum(currentHits);
    const past = getSum(pastHits);
    if (current && past && (current > past)) {
      return Math.round((current - past) / past * 100);
    } else if (past > current) {
      return - Math.round((past - current) / past * 100);
    } else {
      return 0;
    }
  }

  displayPlaceholder(eventName: MovieAnalyticsEventName) {
    return !(typeof this.totalHitsOnCurrentMonth(eventName) === 'number');
  }
}
