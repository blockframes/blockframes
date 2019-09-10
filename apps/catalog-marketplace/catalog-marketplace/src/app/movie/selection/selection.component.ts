import { CatalogBasket } from '@blockframes/catalog-marketplace';
import { BasketQuery } from '../../distribution-right/+state/basket.query';
import { ChangeDetectionStrategy } from '@angular/core';
import { BasketStatus } from '../../distribution-right/+state/basket.model';
import { Component, OnInit } from '@angular/core';
import { staticModels, MovieQuery } from '@blockframes/movie';
import { FormControl } from '@angular/forms';
import { BasketService } from '../../distribution-right/+state/basket.service';

@Component({
  selector: 'catalog-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogSelectionComponent implements OnInit {
  public priceControl: FormControl = new FormControl(null);
  public currencyList: string[];
  public selectedCurrency;

  constructor(
    private basketService: BasketService,
    private movieQuery: MovieQuery,
    private basketQuery: BasketQuery
  ) {}

  ngOnInit() {
    this.currencyList = staticModels['MOVIE_CURRENCIES'].map(key => key.slug);
    // TODO #922: make an observable out of the basketquery
  }

  private getMovieTitle(id: string): string {
    let movieLookup: string;
    this.movieQuery
      .getAll({ filterBy: movie => movie.id === id })
      .forEach(movie => (movieLookup = movie.main.title.original));
    if (!movieLookup) {
      throw new Error(`No movie found for this ${id} id`);
    }
    return movieLookup;
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
