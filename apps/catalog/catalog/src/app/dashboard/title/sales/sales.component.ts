import { Component, OnInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/movie+state/movie.model';
import { MovieService } from '@blockframes/movie/movie+state/movie.service';
import { MovieQuery } from '@blockframes/movie/movie+state/movie.query';
import { Observable } from 'rxjs';
import { ChartComponent } from 'ng-apexcharts';
import { ChartOptions, lineChartOptions } from './default-chart-options';

const lineCharts = [
  {
    label: 'movieViews',
    title: 'Page views',
    icon: 'eye'
  },
  {
    label: 'addedToWishlist',
    title: 'Adds to Wishlist',
    icon: 'mouse_pointer'
  },
  {
    label: 'promoReelOpened',
    title: 'Clicks on promotional elements',
    icon: 'specific_delivery_list'
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
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  lineCharts = lineCharts;
  
  constructor(private movieService: MovieService, private movieQuery: MovieQuery) {   
    this.lineChartOptions = lineChartOptions;
  }

  ngOnInit() {
    this.movieAnalytics$ = this.movieService.getMovieAnalytics([this.movieQuery.getActiveId()]);
  }

  populateData(data: object, name: string, key: string, period: string):number[] {
    const numArray = data[0][name][period].map(d => d[key]);
    return numArray;
  }

  getLineChartSeries(data: object, name: string) {
    return [{name, data: this.populateData(data, name, 'hits', 'current')}];
  }

  getLineChartXaxis(data: object, name: string) {
    return {
      categories:  this.populateData(data, name, 'event_date', 'current'), 
      labels: {show: false},  
      axisBorder: {show: false},  
      axisTicks: {show: false}
    };
  }

  sum(array: number[]): number {
    return array.reduce((p, c) => p + c, 0);
  }

  calculatePercentage(data: object, name: string): number {
    const current = this.sum(this.populateData(data, name, 'hits', 'current'));
    const past = this.sum(this.populateData(data, name, 'hits', 'past'));
    if (current && past && (current > past)) {
      return (current - past) / past * 100
    } else if (past > current) {
      return - (past - current) / past * 100
    } else {
      return 0
    }
  }

}
