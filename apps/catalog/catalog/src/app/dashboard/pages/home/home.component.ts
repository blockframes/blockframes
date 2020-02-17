import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Observable } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { map, switchMap } from 'rxjs/operators';
import { ContractQuery } from '@blockframes/contract/contract/+state';
import { Contract } from '@blockframes/contract/contract/+state/contract.model';
import { getContractLastVersion } from '@blockframes/contract/version/+state/contract-version.model';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public loading$: Observable<boolean>;
  public contracts$: Observable<Contract[]>;
  public ids: Observable<string[]>;

  constructor(
    private movieQuery: MovieQuery, 
    private movieService: MovieService,
    private contractQuery: ContractQuery
  ) {}

  ngOnInit() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movieAnalytics$ = this.movieQuery.select('ids').pipe(
      switchMap(ids => this.movieService.getMovieAnalytics(ids))
    );
  this.ids = this.movieQuery.select('ids');
  }

}
