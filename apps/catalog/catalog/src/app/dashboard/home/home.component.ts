import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Optional } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Observable, Subscription } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { Intercom } from 'ng-intercom';
import { switchMap } from 'rxjs/operators';

const isAcceptedInApp = movie => movie.storeConfig.status === 'accepted' && movie.storeConfig.appAccess.catalog === true;

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public movies$ = this.movieQuery.selectAll({ filterBy: isAcceptedInApp });
  public moviesLoading$ = this.movieQuery.selectLoading();
  private sub: Subscription;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private dynTitle: DynamicTitleService,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    this.sub = this.movies$.pipe(switchMap(movies => {
      const ids = movies.map(movie => movie.id);
      return this.movieService.syncWithAnalytics(ids)
    })).subscribe();
    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();
    this.movieQuery.getCount()
      ? this.dynTitle.setPageTitle('Seller\'s Dashboard')
      : this.dynTitle.setPageTitle('New Title')
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
