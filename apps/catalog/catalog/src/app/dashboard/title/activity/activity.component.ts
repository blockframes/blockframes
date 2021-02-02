import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { getMovieReceipt } from '@blockframes/movie/+state/movie.model';
import { Observable } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { AnalyticsService } from '@blockframes/utils/analytics/analytics.service';

@Component({
  selector: 'catalog-title-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleActivityComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public contracts$: Observable<Contract[]>;
  public getMovieReceipt = getMovieReceipt
  public movieId: string;

  constructor(
    private analyticsService: AnalyticsService,
    private movieQuery: MovieQuery,
    private contractQuery: ContractQuery,
  ) {}

  ngOnInit() {
    this.movieId = this.movieQuery.getActiveId();
    this.movieAnalytics$ = this.analyticsService.valueChanges([this.movieId])
    this.contracts$ = this.contractQuery.selectAll().pipe(
      map(contracts => contracts.filter(contract => contract.lastVersion.titles[this.movieId]))
    )
  }
}
