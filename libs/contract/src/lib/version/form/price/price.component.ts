import { CatalogCart } from '@blockframes/organization/cart/+state/cart.model';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { FormControl } from '@angular/forms';
import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContractVersionPriceForm } from './price.form';

@Component({
  selector: '[form] contract-version-form-price',
  templateUrl: 'price.component.html',
  styleUrls: ['price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceComponent implements OnInit {
  @Input() form: ContractVersionPriceForm;

  public movieCtrl = new FormControl();

  public staticCurrencies = staticModels.MOVIE_CURRENCIES;

  public availableMovies: CatalogCart;

  constructor(private cartService: CartService) { }

  async ngOnInit() {
    this.availableMovies = await this.cartService.getCart()
  }
}
