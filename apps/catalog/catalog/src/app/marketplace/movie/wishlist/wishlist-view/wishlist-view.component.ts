import { ChangeDetectionStrategy } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Wishlist } from '@blockframes/organization';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { map, tap } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-wishlist-view',
  templateUrl: './wishlist-view.component.html',
  styleUrls: ['./wishlist-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WishlistViewComponent implements OnInit {
  public currentWishlist$: Observable<Wishlist>;

  constructor(
    private catalogCartQuery: CatalogCartQuery,
    private title: Title
  ) { }

  ngOnInit() {
    this.currentWishlist$ = this.catalogCartQuery.wishlistWithMovies$.pipe(
      map(wishlist => wishlist.find(wish => wish.status === 'pending')),
      tap(wishlist => wishlist.movies.length
        ? this.title.setTitle('Wishlist - Archipel Content')
        : this.title.setTitle('No titles in wishlist - Archipel Content'))
    );
  }
}
