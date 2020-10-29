import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Movie, MovieQuery } from '@blockframes/movie/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { genres as staticGenre } from '@blockframes/utils/static-model';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';

interface CarouselSection {
  title: string;
  subline: string;
  movies: Partial<Movie>[];
  queryParams?: Record<string, string>;
}
@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceHomeComponent implements OnInit {

  /** Observable to fetch all movies from the store */
  public moviesBySections$: Observable<CarouselSection[]>;

  constructor(private movieQuery: MovieQuery, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Marketplace')
  }

  ngOnInit() {
    const latest$ = this.movieQuery.selectAll({
      filterBy: movie => this.defaultFilter(movie)
    }).pipe( map(movies => movies.sort((a, b) => sortMovieBy(a, b, 'Production Year'))));
    const postProduction$ = this.movieQuery.selectAll({
      filterBy: movie => movie.productionStatus === 'post_production' && this.defaultFilter(movie)
    });
    const completed$ = this.movieQuery.selectAll({
      filterBy: movie => movie.productionStatus === 'finished' && this.defaultFilter(movie)
    });

    this.moviesBySections$ = combineLatest([latest$, postProduction$, completed$]).pipe(
      map(([latest, postProduction, completed]) => {
        return [
          {
            title: 'New Films',
            subline: 'Discover our latest releases',
            movies: latest
          },
          {
            title: 'Post-Production Films',
            subline: 'Brand new projects with great potential',
            movies: postProduction,
            queryParams: { productionStatus: 'post_production' }
          },
          {
            title: 'Completed Films',
            subline: 'Explore our selection of fresh or library titles',
            movies: completed,
            queryParams: { productionStatus: 'finished' }
          }
        ];
      })
    );
  }

  defaultFilter(movie: Movie) {
    return movie.storeConfig.appAccess.catalog
      && movie.storeConfig.status === "accepted"
      && movie.contentType === 'feature_film';
  }

  public layout(index: number) {
    return index % 2 === 0 ? 'row' : 'row-reverse';
  }

  public alignment(index: number) {
    return index % 2 === 0 ? 'start start' : 'start end';
  }

  // TODO 1880 country short code
  public getMainInfo(movie: Movie) {
    const { originCountries, runningTime, genres } = movie;
    return [
      originCountries.slice(0, 2).map(country => country.toUpperCase()).join(', '),
      typeof runningTime.time === 'number' ? `${runningTime.time} min` : 'TBC',
      genres.slice(0, 2).map(genre => staticGenre[genre]).join(', '),
    ].filter(value => !!value).join(' | ');
  }
}
