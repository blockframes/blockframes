import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { CatalogCartQuery } from '../../../distribution-deal/+state/cart.query';
import { CartService } from '../../../distribution-deal/+state/cart.service';
import { Movie } from '@blockframes/movie';
import { MatSnackBar } from '@angular/material';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistViewComponent implements OnInit {
  public wishlists$: Observable<Wishlist[]>;
  public currentWishlist$: Observable<Wishlist>;

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private analytics: FireAnalytics
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === WishlistStatus.pending))
    );
    this.wishlists$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.filter(wish => wish.status === WishlistStatus.sent))
    );
  }

  // Update the status of the wishlist
  public updateWishlistStatus(movies: Movie[]) {
    try {
      this.cartService.updateWishlistStatus(movies);
      this.snackBar.open('Your current wishlist has been sent.', 'close', { duration: 2000 });
      this.analytics.event('wishlist_send', {
        wishlist: movies
      });
    } catch (err) {
      this.snackBar.open(err.message, 'close', { duration: 2000 });
    }
  }
}
