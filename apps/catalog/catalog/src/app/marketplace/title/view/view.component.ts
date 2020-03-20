import { RouterQuery } from '@datorama/akita-ng-router-store';
import { map } from 'rxjs/operators';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { Movie } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Router } from '@angular/router';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { workType } from '@blockframes/movie/movie/+state/movie.firestore';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-movie-view';
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  // Flag to indicate which icon and message to show
  public toggle$: Observable<boolean>;

  navLinks = [{
    path: 'main',
    label: 'Main Information'
  }, {
    path: 'avails',
    label: 'Avails'
  }];

  constructor(
    private movieQuery: MovieQuery,
    private cartService: CartService,
    private orgQuery: OrganizationQuery,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    public router: Router,
    private title: Title,
    private routerQuery: RouterQuery
  ) { }

  ngOnInit() {
    this.getMovie();
    this.toggle$ = this.orgQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(this.movieQuery.getActiveId()));
      })
    );
    this.refreshTitle();
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
  }

  /**
   * We need to dinstinguish between page load and route change
   * from mat tab component. The routerQuery returns the old value
   * before mat tab changed the route, but this clashes with init
   * page load where the route is correct.
   * @param link optional param when the function is getting called from the template 
   */
  public refreshTitle(link?: string) {
    if (link) {
      link === 'main'
        ? this.title.setTitle(`${this.movieQuery.getActive().main.title.international} - Main information - Archipel Content`)
        : this.title.setTitle(`${this.movieQuery.getActive().main.title.international} - Avails - Archipel Content`)
    } else {
      this.routerQuery.getValue().state.url.split('/').includes('main')
        ? this.title.setTitle(`${this.movieQuery.getActive().main.title.international} - Main information - Archipel Content`)
        : this.title.setTitle(`${this.movieQuery.getActive().main.title.international} - Avails - Archipel Content`)
    }
  }

  public sendPromoReelAnalytic() {
    const movie = this.movieQuery.getActive();
    this.analytics.event('promoReelOpened', {
      movieId: movie.id,
      movie: movie.main.title.original
    });
  }

  public addToWishlist() {
    const movie = this.movieQuery.getActive();
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('addedToWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been added to your selection.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist() {
    const movie = this.movieQuery.getActive();
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
  }

  public getTitle(movie: Movie) {
    const { totalRunTime, genres, originalLanguages } = movie.main;
    const workTypeRegistered = movie.main.workType;
    return [
      getKeyIfExists(workType, workTypeRegistered) ? workType[workTypeRegistered] : '',
      typeof totalRunTime === 'number' ? `${totalRunTime} min` : '',
      genres.map(genre => getLabelBySlug('GENRES', genre)).join(', '),
      originalLanguages.map(language => language).join(', ')
    ].filter(value => !!value).join(' | ');
  }

  public getDirectors(movie: Movie) {
    return movie.main.directors.map(d => `${d.firstName}  ${d.lastName}`).join(', ');
  }

  // TODO#1658 Update LANGUAGES static model to be RFC-5646 compliant
  public getOriginalCountries(movie: Movie) {
    return `${movie.main.originCountries.map(country => getLabelBySlug('TERRITORIES', country)).join(', ')}, ${movie.main.productionYear}`;
  }

}
