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
  public movieDistributionRights: MovieData[] = [];

  constructor(
    private basketService: BasketService,
    private movieQuery: MovieQuery,
    private basketQuery: BasketQuery
  ) {}

  ngOnInit() {
    this.currencyList = MOVIE_CURRENCIES_SLUG;
    // TODO #922: make an observable out of the basketquery
    this.basketQuery.getAll().forEach(basket =>
      basket.rights.forEach(right => {
        this.movieDistributionRights.push(this.createRightDetail(right));
      })
    );
  }

  private createRightDetail(detail: DistributionRight) {
    return {
      id: detail.id,
      movieName: this.getMovieTitle(detail.movieId),
      territory: detail.territories[0],
      rights: detail.medias[0],
      endRights: (detail.duration as any).to.toDate().toDateString(),
      languages: detail.languages[0],
    } as MovieData;
  }

  private getMovieTitle(id: string): string {
    const movie = this.movieQuery.getEntity(id);
    if (movie) {
      return movie.main.title.original;
    }
    else {
      throw new Error(`No movie found for this id: ${id}`);
    }
  }

  public deleteDistributionRight(rightId: string) {
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
