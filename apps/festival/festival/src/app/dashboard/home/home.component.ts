import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization/+state';

import { MediaService } from '@blockframes/utils/media/media.service'

@Component({
  selector: 'festival-dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public movieAnalytics$: Observable<MovieAnalytics[]>;
  public hasMovies$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private mediaService: MediaService
  ) { }

  @ViewChild('file') ctrl: ElementRef<HTMLInputElement>;
  dev() {
    const file = this.ctrl.nativeElement.files
    this.mediaService.uploadFile(`dev-max/${Math.random().toString()}`, file)
  }

  ngOnInit() {
    this.movieAnalytics$ = this.movieQuery.analytics.selectAll();

    const titles$ = this.orgQuery.selectActive().pipe(
      switchMap(({ movieIds }) => this.movieService.valueChanges(movieIds)),
      map(movies => movies.filter(movie => movie.main.storeConfig.status === 'accepted')),
      shareReplay(1)
    )

    this.hasMovies$ = titles$.pipe(
      map(titles => !!titles.length)
    );

    this.sub = titles$.pipe(
      map(movies => movies.map(m => m.id)),
      switchMap(movieIds => this.movieService.syncWithAnalytics(movieIds))
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
