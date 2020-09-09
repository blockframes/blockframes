import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { getMovieReceipt } from '@blockframes/movie/+state/movie.model';
import { Observable } from 'rxjs';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { map } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'financiers-title-activity',
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
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private contractQuery: ContractQuery,
    private dynTitle: DynamicTitleService,
  ) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Title page', 'Marketplace Activity');
    this.movieId = this.movieQuery.getActiveId();
    this.movieAnalytics$ = this.movieService.getMovieAnalytics([this.movieId]);
    this.contracts$ = this.contractQuery.selectAll().pipe(
      map(contracts => contracts.filter(contract => contract.lastVersion.titles[this.movieId]))
    )
  }
}
