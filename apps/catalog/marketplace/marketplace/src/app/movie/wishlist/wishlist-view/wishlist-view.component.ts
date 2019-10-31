import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { BasketQuery } from '../../../distribution-right/+state/basket.query';
import { BasketService } from '../../../distribution-right/+state/basket.service';
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
    private basketQuery: BasketQuery,
    private basketService: BasketService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.basketQuery.wishlistsWithMovies$.pipe(
      map(wishlists => wishlists.find(wishlist => wishlist.status === WishlistStatus.pending))
    );
    this.wishlists$ = this.basketQuery.wishlistsWithMovies$.pipe(
      map(wishlists => wishlists.filter(wishlist => wishlist.status === WishlistStatus.sent))
    );
  }

  public updateWishlistStatus(movies: Movie[]) {
    try {
      this.basketService.updateWishlistStatus(movies);
      this.snackBar.open('Your current wishlist has been sent.', 'close', { duration: 2000 });
    } catch (err) {
      this.snackBar.open(err.message, 'close', { duration: 2000 });
    }
  }
}
