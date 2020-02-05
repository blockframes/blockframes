import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.firestore';
import { ChartOptions, lineChartOptions } from './default-chart-options';

const chartInfo = [
  {
    eventName: 'movieViews',
    title: 'Page views',
    icon: 'eye'
  },
  {
    eventName: 'addedToWishlist',
    title: 'Adds to Wishlist',
    icon: 'mouse_pointer'
  },
  {
    eventName: 'promoReelOpened',
    title: 'Clicks on promotional elements',
    icon: 'specific_delivery_list'
  }
] as const;

type MovieAnalyticsEventName = typeof chartInfo[number]['eventName']

function sum(array: number[]): number {
  return array.reduce((sum, num) => sum + num, 0);
}

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

function toYMD(date: Date) {
  const m = date.getMonth()
  const d = date.getDate()
  return `${date.getFullYear()}${m < 10 ? `0${m+1}` : m+1}${d < 10 ? `0${d}` : d}`;
}

@Component({
  selector: '[analyticsData] movie-analytics-chart',
  templateUrl: './movie-analytics-chart.component.html',
  styleUrls: ['./movie-analytics-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieAnalyticsChartComponent implements OnInit {
  public lineChartOptions: Partial<ChartOptions>;
  public chartInfo = chartInfo;
  public filteredEvent;

  @Input() analyticsData: MovieAnalytics[];
  @Input() events: string[];
  
  constructor() {   
    this.lineChartOptions = lineChartOptions;
  }

  ngOnInit() {
    this.filteredEvent = chartInfo.filter(({ eventName }) => this.events.includes(eventName));
  }

  populate(eventName: MovieAnalyticsEventName, period: 'current' | 'past') {
    const x = period === 'current' ? getLastDays(28) : getLastDays(56, 28);
    const y = [];
    for(const date of x.map(toYMD)) {
      let sum = 0;
      for(const movieAnalytic of this.analyticsData) {
        const event = movieAnalytic[eventName][period].find(e => e.event_date === date);
        sum += event ? event.hits : 0;
      }
      y.push(sum);
    }
    return { x , y }
  }

  getLineChartSeries(eventName: MovieAnalyticsEventName) {
    return [{name, data: this.populate(eventName, 'current').y}];
  }

  getLineChartXaxis(eventName: MovieAnalyticsEventName) {
    return {
      categories:  this.populate(eventName, 'current').x, 
      labels: {show: false},  
      axisBorder: {show: false},  
      axisTicks: {show: false}
    };
  }

  totalHitsOnCurrentMonth(eventName: MovieAnalyticsEventName) {
    const total = this.populate(eventName, 'current').y
    return sum(total);
  }

  calculatePercentage(eventName: MovieAnalyticsEventName): number {
    const current = sum(this.populate(eventName, 'current').y);
    const past = sum(this.populate(eventName, 'past').y);
    if (current && past && (current > past)) {
      return (current - past) / past * 100
    } else if (past > current) {
      return - (past - current) / past * 100
    } else {
      return 0
    }
  }
}
