import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { OrganizationQuery, Wishlist } from '@blockframes/organization';
import { AFM_DISABLE } from '@env';
import { DistributionRight, MovieData } from '../../distribution-deal/+state/cart.model';
import { CatalogCart, CartQuery } from '../../distribution-deal/+state';
import { ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { CartStatus } from '../../distribution-deal/+state/cart.model';
import { Component, OnInit } from '@angular/core';
import { MovieQuery } from '@blockframes/movie';
import {
  MOVIE_CURRENCIES_SLUG,
  MovieCurrenciesSlug
} from '@blockframes/movie/movie/static-model/types';
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
    private movieQuery: MovieQuery,
    private cartQuery: CartQuery,
    private orgQuery: OrganizationQuery,
    private matSnackbar: MatSnackBar
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
      this.cartQuery.getAll().forEach(cart =>
        cart.deals.forEach(deal => {
          // TODO issue#1146
          // this.movieDistributionRights.push(this.createRightDetail(right));
        })
      );
    }
  }

  private createRightDetail(detail: DistributionRight) {
    return {
      id: detail.id,
      movieName: this.getMovieTitle(detail.movieId),
      territory: detail.territories[0],
      rights: detail.medias[0],
      duration: detail.duration
      // TODO#1071: refactor the model after the ui presentation
    } as MovieData;
  }

  private getMovieTitle(id: string): string {
    const movie = this.movieQuery.getEntity(id);
    if (movie) {
      return movie.main.title.original;
    } else {
      throw new Error(`No movie found for this id: ${id}`);
    }
  }

  public async deleteDistributionRight(dealId) {
    /*
    // TODO issue#1146
    if (!AFM_DISABLE) {
      const result: boolean | Error = this.cartService.removeMovieFromWishlist(dealId);
      if (typeof result === 'boolean') {
        return;
      } else {
        this.matSnackbar.open(result.message, 'close', { duration: 3000 });
        return;
      }
    } else {
      const findCart: CatalogCart[] = [];
      this.cartQuery.getAll().forEach(carts =>
        carts.deals.forEach(deal => {
          if (deal.id === dealId) {
            findCart.push(carts);
          }
        })
      );
      let findCartId: string;
      findCart.forEach(cart => (findCartId = cart.name));
      this.cartService.removeDistributionRight(dealId, findCartId);
    }*/
  }

  // TODO#918: We have to think about how we want to bundle/handle multiple pending distrights
  public setPriceCurrency() {
    const [oldCart]: CatalogCart[] = this.cartQuery.getAll();
    const updatedBasket: CatalogCart = {
      ...oldCart,
      price: { amount: this.priceControl.value, currency: this.selectedCurrency },
      status: CartStatus.submitted
    };
    this.cartService.updateCart(updatedBasket);
  }
}
