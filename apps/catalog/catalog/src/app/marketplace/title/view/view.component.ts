import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CartService } from '@blockframes/cart/+state/cart.service';
import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { contentType } from '@blockframes/movie/+state/movie.firestore';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceMovieViewComponent implements OnInit, OnDestroy {
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  // Flag to indicate which icon and message to show
  public toggle$: Observable<boolean>;

  private sub: Subscription;

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
    private routerQuery: RouterQuery,
    private dynTitle: DynamicTitleService,
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
    this.sub = this.routerQuery.select('state').subscribe(data => {
      data.url.includes('main')
        ? this.dynTitle.setPageTitle(`${this.movieQuery.getActive().main.title.international}`, 'Main information')
        : this.dynTitle.setPageTitle(`${this.movieQuery.getActive().main.title.international}`, 'Avails')
    })
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
    this.snackbar.open(`Title ${title} has been added.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist() {
    const movie = this.movieQuery.getActive();
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`Title ${title} has been removed.`, 'close', { duration: 2000 });
  }

  public getTitle(movie: Movie) {
    const { totalRunTime, genres, originalLanguages } = movie.main;
    const contentTypeRegistered = movie.main.contentType;
    return [
      getKeyIfExists(contentType, contentTypeRegistered) ? contentType[contentTypeRegistered] : '',
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


  ngOnDestroy() {
    // prevents Error when user switches quick the tabs
    if (this.sub) this.sub.unsubscribe();
  }
}
