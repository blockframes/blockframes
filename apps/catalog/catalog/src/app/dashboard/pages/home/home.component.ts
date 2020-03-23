import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Observable, Subscription } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public movies$ = this.movieQuery.selectAll();
  private sub: Subscription;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private title: Title
  ) { }

  ngOnInit() {
    this.sub = this.movieService.syncAnalytics({ filterBy: movie => movie.main.storeConfig.status === 'accepted' }).subscribe();
    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();
    Object.keys(this.movieQuery.getValue().entities).length
      ? this.title.setTitle('Seller\'s Dashboard - Archipel Content')
      : this.title.setTitle('New title - Archipel Content')
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
