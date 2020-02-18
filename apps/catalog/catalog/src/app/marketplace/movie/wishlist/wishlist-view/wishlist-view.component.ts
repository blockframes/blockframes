import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Wishlist, WishlistStatus } from '@blockframes/organization';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
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
    private catalogCartQuery: CatalogCartQuery
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === WishlistStatus.pending))
    );
    this.wishlists$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.filter(wish => wish.status === WishlistStatus.sent))
    );
  }
}
