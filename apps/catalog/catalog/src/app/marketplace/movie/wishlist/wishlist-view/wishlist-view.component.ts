import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Wishlist } from '@blockframes/organization';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { map } from 'rxjs/operators';

@Component({
  selector: 'catalog-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistViewComponent implements OnInit {
  public currentWishlist$: Observable<Wishlist>;

  constructor(
    private catalogCartQuery: CatalogCartQuery
  ) {}

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === 'pending'))
    );
  }
}
