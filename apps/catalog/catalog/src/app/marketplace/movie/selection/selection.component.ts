import { Subscription } from 'rxjs';
import { OrganizationQuery, Wishlist } from '@blockframes/organization';
import { AFM_DISABLE } from '@env';
import { ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import {
  MOVIE_CURRENCIES_SLUG,
  MovieCurrenciesSlug
} from '@blockframes/movie/static-model/types';
import { FormControl } from '@angular/forms';
import { CartService } from '../../distribution-deal/+state/cart.service';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSelectionComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-selection';
  public priceControl: FormControl = new FormControl(null);
  public currencyList: MovieCurrenciesSlug[];
  public selectedCurrency;
  // TODO issue#1146 rename it
  public moviesOnWishlist: Wishlist[] = [];
  public wishlist: Subscription;

  constructor(
    private cartService: CartService,
    private orgQuery: OrganizationQuery,
  ) {}

  ngOnInit() {
    // TODO issue#1146
    if (!AFM_DISABLE) {
      this.wishlist = this.orgQuery.select().subscribe(wishlist => {
        this.moviesOnWishlist = wishlist.org.wishlist;
      });
    } else {
      this.currencyList = MOVIE_CURRENCIES_SLUG;
      // TODO #922: make an observable out of the cartquery
    }
  }

  public async deleteDistributionDeal(dealId) {
    // @TODO to implement
  }

  public submitCart() {
    return this.cartService.submitCart(this.priceControl.value, this.selectedCurrency);
  }
}
