import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.model';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';
import { Observable, of } from 'rxjs';
import { ChartComponent } from 'ng-apexcharts';
import { ChartOptions, lineChartOptions } from './default-chart-options';
import { analyticsMockData, contractMockData } from './mockdata';
import _ from 'lodash';
const lineCharts = [
  {
    title: 'movieViews'
  },
  {
    title: 'addedToWishlist'
  },
  {
    title: 'promoReelOpened'
  }
]
@Component({
  selector: 'catalog-title-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSalesComponent implements OnInit {
  @ViewChild('chart', { static: false }) chart: ChartComponent;
  public lineChartOptions: Partial<ChartOptions>;
  public barChartOptions: Partial<ChartOptions>;
  public movieAnalytics: Observable<MovieAnalytics[]>;


  mockData = analyticsMockData;
  contractData$ = of(contractMockData);
  contractMockData = contractMockData;
  lineCharts = lineCharts;
  
  constructor(private movieService: MovieService, private movieQuery: MovieQuery) {   
    this.lineChartOptions = lineChartOptions;
  }

  ngOnInit() {
    this.movieAnalytics = this.movieService.getMovieAnalytics([this.movieQuery.getActiveId()]);
  }

  populateSeries(analytics, name: string) {
    const hitsArray = analytics[name].map(d => d.hits);
    return [{name, data: hitsArray}];
  }

  populateXaxis(analytics, name: string) {
    const dateArray = analytics[name].map(d => d.event_date);
    return {categories: dateArray, labels: {show: false},  axisBorder: {show: false},  axisTicks: {show: false}};
  }

  getTotal(analytics, name: string): number {
    const hitsArray = analytics[name].map(d => d.hits);
    return hitsArray.reduce((p, c) => p + c, 0);
  }

  sum(array: number[]): number {
    return array.reduce((p, c) => p + c, 0);
  }

  calculatePercentage(analytics, name: string): number {
    console.log(analytics[name])
    // const groupedByMonth = _.groupBy(analytics[name], function(item) {
    //   return item.event_date.substring(0, 7); 
    // });
    const hitsArray = analytics[name].map(d => d.hits);
    const current = hitsArray[hitsArray.length-1];
    const previous = hitsArray[hitsArray.length-2] 
    if (current > previous) {
      return (current - previous) / previous * 100
    } else if (previous > current) {
      return - (previous - current) / previous * 100
    } else {
      return 0
    }
  }

}
