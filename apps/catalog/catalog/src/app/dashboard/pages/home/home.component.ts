import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Observable } from 'rxjs';
import { MovieAnalytics } from '@blockframes/movie/movie/+state/movie.firestore';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public movieAnalytics$: Observable<MovieAnalytics[]>;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
  ) {}

  ngOnInit() {
    this.movieAnalytics$ = this.movieQuery.selectAll({ filterBy: movie => movie.main.storeConfig.status === 'accepted' }).pipe(
      map(movies => movies.map(movie => movie.id)),
      switchMap(ids => this.movieService.getMovieAnalytics(ids)));
  }
}
