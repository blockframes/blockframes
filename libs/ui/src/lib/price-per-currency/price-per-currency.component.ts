import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MovieCurrency, PricePerCurrency, convertCurrenciesTo } from '@blockframes/model';

@Component({
  selector: '[price] price-per-currency',
  templateUrl: 'price-per-currency.component.html',
  styleUrls: ['./price-per-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricePerCurrencyComponent {

  @Input() price: PricePerCurrency;
  @Input() convertTo: MovieCurrency;

  public convertedCurrencies() {
    if(!this.convertTo) return false;
    return convertCurrenciesTo(this.price, this.convertTo)[this.convertTo];
  }
}
