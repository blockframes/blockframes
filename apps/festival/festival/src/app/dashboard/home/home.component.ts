import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { MovieAnalytics } from '@blockframes/movie/+state/movie.firestore';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { map, switchMap, shareReplay } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { FormList } from '@blockframes/utils/form';
import { DirectorForm } from '@blockframes/movie/form/main/main.form'

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
    private orgQuery: OrganizationQuery
  ) { }

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

  displayedColumns = ['First Name', 'Last Name', '1', '2', '3', '4', '5', '6'];
  dataSource = FormList.factory([{ firstName: 'MaxMaxMaxMax', lastName: 'FritzFritzFritzFritz' }, { firstName: 'Hannah', lastName: 'Arendt' }], el => new DirectorForm(el))
}
