import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { map } from 'rxjs/operators';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: 'movie-dashboard-title-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public form$: Observable<MovieForm>;
  public loading$: Observable<boolean>;
  public getLabelBySlug = getLabelBySlug;

  constructor(private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
    this.form$ = this.movieQuery.selectActive().pipe(map(movie => new MovieForm(movie)));
  }

  public getDirectors(movie: Movie) {
    return movie.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }
}
