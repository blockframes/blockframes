import { map } from 'rxjs/operators';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Router } from '@angular/router';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { workType } from '@blockframes/movie/+state/movie.firestore';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { OrganizationQuery } from '@blockframes/organization/organization/+state/organization.query';

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
  },{
    path: 'avails',
    label: 'Avails'
  }];

  constructor(
    private movieQuery: MovieQuery,
    private cartService: CartService,
    private orgQuery: OrganizationQuery,
    private snackbar: MatSnackBar,
    private analytics: FireAnalytics,
    public router: Router
  ) {}

  ngOnInit() {
    this.getMovie();
    this.toggle$ = this.orgQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(this.movieQuery.getActiveId()));
      })
    );
  }

  private getMovie() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movie$ = this.movieQuery.selectActive();
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
