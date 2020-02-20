import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: 'catalog-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent implements OnInit {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  public getLabelBySlug = getLabelBySlug;

  navLinks = [{
    path: 'activity',
    label: 'Marketplace Activity'
  }, {
    path: 'details',
    label: 'Film Details'
  },{
    path: 'sales',
    label: 'Sales'
  }];
  constructor(private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.getMovie();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public getPoster(movie: Movie) {
    return movie.promotionalElements.poster.length && movie.promotionalElements.poster[0].media;
  }

  public getDirectors(movie: Movie) {
    return movie.main.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }

  public getOriginalCountries(movie: Movie) {
    return `${movie.main.originCountries.map(country => getLabelBySlug('TERRITORIES', country)).join(', ')}, ${movie.main.productionYear}`;
  }
}
