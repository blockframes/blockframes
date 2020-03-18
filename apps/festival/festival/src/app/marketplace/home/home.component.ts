import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Movie, MovieQuery, MovieMain } from '@blockframes/movie/movie/+state';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Observable } from 'rxjs';

interface CarouselSection {
  title: string;
  subline: string;
  movies$: Observable<Movie[]>;
}


@Component({
  selector: 'festival-marketplace-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {

  /** Observable to fetch all movies from the store */
  public moviesBySections$: Observable<CarouselSection[]>;
  public sections: CarouselSection[];

  constructor(
    private movieQuery: MovieQuery,
    private cartService: CartService,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    private catalogCartQuery: CatalogCartQuery,
  ) {}

  ngOnInit() {
    const selectMovies = (status: MovieMain['status']) => {
      return this.movieQuery.selectAll({
        filterBy: movies => movies.main.status === status
      });
    }
    this.sections = [
      {
        title: 'Pre Production Films',
        subline: 'Discover our latest releases',
        movies$: selectMovies('financing')
      },
      {
        title: 'In Production Films',
        subline: 'Discover our latest releases',
        movies$: selectMovies('shooting')
      },
      {
        title: 'Post-Production Films',
        subline: 'Brand new projects with great potential',
        movies$: selectMovies('post-production')
      },
      {
        title: 'Completed Films',
        subline: 'Explore our selection of fresh or library titles',
        movies$: selectMovies('finished')
      }
    ];
  }

  public layout(index: number) {
    return index % 2 === 0 ? 'row' : 'row-reverse';
  }

  public alignment(index: number) {
    return index % 2 === 0 ? 'start start' : 'start end';
  }

  public toggle$(movieId: string) {
    return this.catalogCartQuery.isAddedToWishlist(movieId);
  }

  public addToWishlist(movie: Movie, event: Event) {
    event.stopPropagation();
    this.cartService.updateWishlist(movie);
    this.snackbar.open(`${movie.main.title.international} has been added to your selection.`, 'close', { duration: 2000 });
    this.analytics.event('addedToWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original,
    });
  }

  public removeFromWishlist(movie: Movie, event: Event) {
    event.stopPropagation();
    this.cartService.updateWishlist(movie);
    this.snackbar.open(`${movie.main.title.international} has been removed from your selection.`, 'close', { duration: 2000 });
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original,
    });
  }

  public getBanner(movie: Movie): string {
    const movieElement = movie.promotionalElements.banner;
    return movieElement && movieElement.media && movieElement.media.url;
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
