import { CatalogCart } from '@blockframes/organization/cart/+state/cart.model';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { FormControl } from '@angular/forms';
import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ContractVersionPriceForm } from './price.form';
import { from, Subscription } from 'rxjs';

@Component({
  selector: '[form] contract-version-form-price',
  templateUrl: 'price.component.html',
  styleUrls: ['price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceComponent implements OnInit, OnDestroy {
  @Input() form: ContractVersionPriceForm;

  public movieCtrl = new FormControl();

  public staticCurrencies = staticModels.MOVIE_CURRENCIES;

  public sub: Subscription;

  public availableMovies: CatalogCart;

  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.sub = from(this.cartService.getCart()).subscribe(movies => this.availableMovies = movies)
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
