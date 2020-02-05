import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieAnalytics, EventAnalytics } from '@blockframes/movie/movie+state/movie.firestore';
import { Observable, of } from 'rxjs';
import { ChartOptions, lineChartOptions } from './default-chart-options';
import { analyticsMockData } from './mockData';

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
  return array.reduce((p, c) => p + c, 0);
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
  analyticsMockData$ = of(analyticsMockData)

  @Input() analyticsData: Observable<MovieAnalytics[]>;
  @Input() events: string[];
  
  constructor() {   
    this.lineChartOptions = lineChartOptions;
  }

  ngOnInit() {
    this.filteredEvent = chartInfo.filter(({ eventName }) => this.events.includes(eventName));
  }

  populateData(
    data: EventAnalytics[], 
    name: MovieAnalyticsEventName, 
    key: 'event_date' | 'hits', 
    period: 'current' | 'past'
  ):number[] {
    return data[0][name][period].map(analyticsData => analyticsData[key]);
  }

  getLineChartSeries(data: EventAnalytics[], name: MovieAnalyticsEventName) {
    return [{name, data: this.populateData(data, name, 'hits', 'current')}];
  }

  getLineChartXaxis(data: EventAnalytics[], name: MovieAnalyticsEventName) {
    return {
      categories:  this.populateData(data, name, 'event_date', 'current'), 
      labels: {show: false},  
      axisBorder: {show: false},  
      axisTicks: {show: false}
    };
  }

  totalHitsOnCurrentMonth(data: EventAnalytics[], name: MovieAnalyticsEventName) {
    return sum(this.populateData(data, name, 'hits', 'current'))
  }

  calculatePercentage(data: EventAnalytics[], name: MovieAnalyticsEventName): number {
    const current = sum(this.populateData(data, name, 'hits', 'current'));
    const past = sum(this.populateData(data, name, 'hits', 'past'));
    if (current && past && (current > past)) {
      return (current - past) / past * 100
    } else if (past > current) {
      return - (past - current) / past * 100
    } else {
      return 0
    }
  }
}
