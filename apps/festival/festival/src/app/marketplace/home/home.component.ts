import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Movie, MovieQuery, MovieMain, MovieService } from '@blockframes/movie/+state';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Observable, Subscription } from 'rxjs';

interface CarouselSection {
  title: string;
  subline: string;
  hasMovies$: Observable<boolean>;
  movies$: Observable<Movie[]>;
}


@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  /** Observable to fetch all movies from the store */
  public moviesBySections$: Observable<CarouselSection[]>;
  public sections: CarouselSection[];

  constructor(private movieService: MovieService, private movieQuery: MovieQuery) {}

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();
    const selectMovies = (status: MovieMain['status']) => {
      return this.movieQuery.selectAll({
        filterBy: movies => movies.main.status === status && movies.main.storeConfig.appAccess.festival
      });
    }
    const hasMovies = (status: MovieMain['status']) => {
      return this.movieQuery.hasMovies(movies => movies.main.status === status);
    }
    this.sections = [
      {
        title: 'New Films',
        subline: 'Discover our latest releases',
        hasMovies$: this.movieQuery.hasMovies(movies => movies.main.productionYear >= 2018),
        movies$: this.movieQuery.selectAll({
          filterBy: movies => movies.main. productionYear >= 2018 && movies.main.storeConfig.appAccess.festival
        })
      },
      {
        title: 'Post-Production Films',
        subline: 'Brand new projects with great potential',
        hasMovies$: hasMovies('post-production'),
        movies$: selectMovies('post-production')
      },
      {
        title: 'Completed Films',
        subline: 'Explore our selection of fresh or library titles',
        hasMovies$: hasMovies('finished'),
        movies$: selectMovies('finished')
      }
    ];
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public layout(index: number) {
    return index % 2 === 0 ? 'row' : 'row-reverse';
  }

  public alignment(index: number) {
    return index % 2 === 0 ? 'start start' : 'start end';
  }

  public getBanner(movie: Movie): string {
    const movieElement = movie.promotionalElements.banner;
    return movieElement && movieElement.media && movieElement.media.urls.original;
  }

  // TODO 1880 country short code
  public getMainInfo(movie: Movie) {
    const { originCountries, totalRunTime, genres } = movie.main;
    return [
      originCountries.slice(0, 2).map(country => country.toUpperCase()).join(', '),
      typeof totalRunTime === 'number' ? `${totalRunTime} min` : 'TBC',
      genres.slice(0, 2).map(genre => getLabelBySlug('GENRES', genre)).join(', '),
    ].filter(value => !!value).join(' | ');
  }

}
