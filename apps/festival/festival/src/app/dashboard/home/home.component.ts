import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Observable, Subscription } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'festival-dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public hasMovies$ = this.movieQuery.hasMovies();
  private sub: Subscription;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private intercom: Intercom
  ) {}

  ngOnInit() {
    this.sub = this.movieService.syncAnalytics({ filterBy: movie => movie.main.storeConfig.status === 'accepted' }).subscribe();
    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
