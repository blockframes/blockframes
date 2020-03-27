import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { Observable } from 'rxjs';
import { OrganizationQuery } from '@blockframes/organization';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';

@Component({
  selector: '[movieId] catalog-wishlist-button',
  templateUrl: './wishlist-button.component.html',
  styleUrls: ['./wishlist-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistButtonComponent implements OnInit {

  toggle$: Observable<boolean>;

  @Input() movieId: string;

  constructor(
    private movieQuery: MovieQuery,
    private orgQuery: OrganizationQuery,
    private cartService: CartService,
    private analytics: FireAnalytics,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit() {
    this.toggle$ = this.orgQuery.selectActive().pipe(
      map(org => {
        return org.wishlist
          .filter(({ status }) => status === 'pending')
          .some(({ movieIds }) => movieIds.includes(this.movieId));
      })
    );
  }


  public addToWishlist() {
    const movie = this.movieQuery.getEntity(this.movieId);
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('addedToWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been added to your selection.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist() {
    const movie = this.movieQuery.getEntity(this.movieId);
    const title = movie.main.title.international;
    this.cartService.updateWishlist(movie);
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
    this.snackbar.open(`${title} has been removed from your selection.`, 'close', { duration: 2000 });
  }

}
