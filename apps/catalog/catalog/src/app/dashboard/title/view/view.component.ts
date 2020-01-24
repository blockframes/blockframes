import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery, Movie } from '@blockframes/movie';
import { Observable } from 'rxjs';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { ContractService } from '@blockframes/contract/contract/+state';

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
    path: 'sales',
    label: 'Sales'
  }, {
    path: 'details',
    label: 'Film Details'
  },{
    path: 'avails',
    label: 'Avails'
  }];
  constructor(
    private movieQuery: MovieQuery, private contractService: ContractService) {}

  ngOnInit() {
    this.getMovie();
    this.contractService.syncCollection();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  public getPoster(movie: Movie) {
    return movie.promotionalElements.poster.length && movie.promotionalElements.poster[0].media;
  }

  public getTitle(movie: Movie) {
    const { workType, totalRunTime, status } = movie.main;
    return [
      workType,
      (getLabelBySlug('MOVIE_STATUS', status)),
      `${totalRunTime} min`
    ].join(' | ')
  }

  public getDirectors(movie: Movie) {
    return movie.main.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }

  public getOriginalCountries(movie: Movie) {
    return `${movie.main.originCountries.map(country => getLabelBySlug('TERRITORIES', country)).join(', ')}, ${movie.main.productionYear}`;
  }
}
