import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';

@Component({
  selector: 'festival-dashboard-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public getLabelBySlug = getLabelBySlug;

  navLinks = [
    {
      path: 'details',
      label: 'Film Details'
    }
  ];

  constructor(private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public getPoster(movie: Movie) {
    return movie.main.poster.media;
  }

  public getDirectors(movie: Movie) {
    return movie.main.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }
}
