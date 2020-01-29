import { map } from 'rxjs/operators';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { Movie } from '@blockframes/movie';
import { Component, OnInit, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '@blockframes/movie';
import { OrganizationQuery } from '@blockframes/organization';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import { getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { Router } from '@angular/router';

@Component({
  selector: 'catalog-movie-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MarketplaceMovieViewComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-movie-view';
  public movie$: Observable<Movie>;
  public loading$: Observable<boolean>;
  // Flag to indicate which icon and message to show
  public toggle$: Observable<boolean>;
  public getLabelBySlug = getLabelBySlug;

  navLinks = [{
    path: 'main',
    label: 'Main'
  }, {
    path: 'technical-information',
    label: 'Technical Information'
  },
  {
    path: 'media',
    label: 'Media'
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
    this.analytics.event(AnalyticsEvents.promoReelOpened, {
      movieId: movie.id,
      movie: movie.main.title.original
    });
  }

  public addToWishlist() {
    const movie = this.movieQuery.getActive();
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event(AnalyticsEvents.addedToWishlist, {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been added to your selection.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist() {
    const movie = this.movieQuery.getActive();
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event(AnalyticsEvents.removedFromWishlist, {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
  }

}
