import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.model';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';
import { Observable, of } from 'rxjs';
import { ChartComponent } from 'ng-apexcharts';
import { ChartOptions, lineChartOptions } from './default-chart-options';
import { analyticsMockData, contractMockData } from './mockdata';

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

  populateData(data: object, name: string, key:string):number[] {
    const numArray = data[name].map(d => d[key]);
    return numArray;
  }

  getLineChartSeries(data: object, name: string) {
    return [{name, data: this.populateData(data, name, 'hits')}];
  }

  getLineChartXaxis(data: object, name: string) {
    return {categories:  this.populateData(data, name, 'event_date'), labels: {show: false},  axisBorder: {show: false},  axisTicks: {show: false}};
  }

  sum(array: number[]): number {
    return array.reduce((p, c) => p + c, 0);
  }

  calculatePercentage(data: object, name: string): number {
    console.log(data[name])
    // const groupedByMonth = _.groupBy(analytics[name], function(item) {
    //   return item.event_date.substring(0, 7); 
    // });
    const hitsArray = data[name].map(d => d.hits);
    console.log(hitsArray)
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
