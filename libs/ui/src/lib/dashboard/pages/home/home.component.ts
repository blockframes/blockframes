// Angular
import { Component, OnInit, ChangeDetectionStrategy, Optional } from '@angular/core';

// Blockframes
import { MovieService, fromOrg } from '@blockframes/movie/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { appName, getCurrentApp } from '@blockframes/utils/apps';

// RxJs
import { map, switchMap, shareReplay, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Intercom
import { Intercom } from 'ng-intercom';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  public app = getCurrentApp(this.routerQuery);
  public appName = appName[this.app];
  // accepted and submitted movies only
  public titles$: Observable<Movie[]>;
  public hasMovies$: Observable<boolean>;
  public hasAcceptedMovies$: Observable<boolean>;
  public hasDraftMovies$: Observable<boolean>;

  constructor(
    private movieService: MovieService,
    private orgQuery: OrganizationQuery,
    private dynTitle: DynamicTitleService,
    private routerQuery: RouterQuery,
    @Optional() private intercom: Intercom
  ) { }

  ngOnInit() {
    const allMoviesFromOrg$ = this.orgQuery.selectActive().pipe(
      switchMap(({ id }) => this.movieService.valueChanges(fromOrg(id))),
      shareReplay(1),
      map(titles => titles.filter(title => title.app[this.app].access))
    );

    this.hasAcceptedMovies$ = allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.app[this.app].status === 'accepted'))
    );

    this.hasMovies$ = allMoviesFromOrg$.pipe(
      map(movies => !!movies.length)
    );

    this.hasDraftMovies$ = allMoviesFromOrg$.pipe(
      map(movies => movies.some(movie => movie.app[this.app].status === 'draft'))
    )

    this.titles$ = allMoviesFromOrg$.pipe(
      map(movies => movies.filter(movie => ['accepted', 'submitted'].includes(movie.app[this.app].status))),
      tap(movies => {
        movies.length ?
          this.dynTitle.setPageTitle('Dashboard') :
          this.dynTitle.setPageTitle('Dashboard', 'Empty');
      }),
    );
  }

  public openIntercom(): void {
    return this.intercom.show();
  }
}
