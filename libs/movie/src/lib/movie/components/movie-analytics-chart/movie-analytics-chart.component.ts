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
  return array.reduce((sum, num) => sum + num, 0);
}

function sumArray(arr) {
  return arr.length >= 1 ? arr.reduce((t, e) => t.concat(e)).reduce((t, e) => t + e, 0) : 0;
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
    if(data.length === 1) {
      return data[0][name][period].map(analyticsData => analyticsData[key]);
    } else {
      if (key === 'hits') {
        const hitsArray = data.map(movie => movie[name][period].map(analyticsData => analyticsData[key]))
        console.log(hitsArray)
        console.log(sumArray(hitsArray))
        return hitsArray;
      } else if (key === 'event_date') {
        const uniqueDate = [];
        const dateArray = data.map(movie => movie[name][period].map(analyticsData => {
          return uniqueDate.includes(analyticsData[key]) ? 0 : uniqueDate.push(analyticsData[key])
        }
        ))
        console.log(uniqueDate)
        return uniqueDate;
      }
    }
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
    const total = this.populateData(data, name, 'hits', 'current')
    data.length === 1 ? sum(total) : sumArray(total);
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
