import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { WishList } from '@blockframes/organization';
import { BasketQuery } from '../../../distribution-right/+state/basket.query';

@Component({
  selector: 'catalog-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistViewComponent implements OnInit {
  public wishlists$: Observable<WishList[]>;

  constructor(private basketQuery: BasketQuery) {}

  ngOnInit() {
    this.wishlists$ = this.basketQuery.wishlistsWithMovies$;
  }
}
