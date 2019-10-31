import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { OrganizationQuery, Wishlist } from '@blockframes/organization';
import { AFM_DISABLE } from '@env';
import { DistributionRight, MovieData } from '../../distribution-right/+state/basket.model';
import { CatalogBasket } from '@blockframes/marketplace';
import { BasketQuery } from '../../distribution-right/+state/basket.query';
import { ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { BasketStatus } from '../../distribution-right/+state/basket.model';
import { Component, OnInit } from '@angular/core';
import { MovieQuery } from '@blockframes/movie';
import {
  MOVIE_CURRENCIES_SLUG,
  MovieCurrenciesSlug
} from '@blockframes/movie/movie/static-model/types';
import { FormControl } from '@angular/forms';
import { BasketService } from '../../distribution-right/+state/basket.service';

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
    private basketService: BasketService,
    private movieQuery: MovieQuery,
    private basketQuery: BasketQuery,
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
      // TODO #922: make an observable out of the basketquery
      this.basketQuery.getAll().forEach(basket =>
        basket.rights.forEach(right => {
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

  public async deleteDistributionRight(rightId) {
    // TODO issue#1146
    if (!AFM_DISABLE) {
      const result: boolean | Error = this.basketService.removeMovieFromWishlist(rightId);
      if (typeof result === 'boolean') {
        return;
      } else {
        this.matSnackbar.open(result.message, 'close', { duration: 3000 });
        return;
      }
    } else {
      const findBasket: CatalogBasket[] = [];
      this.basketQuery.getAll().forEach(baskets =>
        baskets.rights.forEach(right => {
          if (right.id === rightId) {
            findBasket.push(baskets);
          }
        })
      );
      let findBasketId: string;
      findBasket.forEach(basket => (findBasketId = basket.id));
      this.basketService.removeDistributionRight(rightId, findBasketId);
    }
  }

  // TODO#918: We have to think about how we want to bundle/handle multiple pending distrights
  public setPriceCurrency() {
    const [oldBasket]: CatalogBasket[] = this.basketQuery.getAll();
    const updatedBasket: CatalogBasket = {
      ...oldBasket,
      price: { amount: this.priceControl.value, currency: this.selectedCurrency },
      status: BasketStatus.submitted
    };
    this.basketService.rewriteBasket(updatedBasket);
  }
}
