import { Component, Input, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { MovieCurrency, PricePerCurrency, convertCurrenciesTo, mainCurrency } from '@blockframes/model';

// TODO #9422 component should not be used on waterfall app
@Component({
  selector: '[price] price-per-currency',
  templateUrl: 'price-per-currency.component.html',
  styleUrls: ['./price-per-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricePerCurrencyComponent {

  @Input() price: PricePerCurrency;
  @Input() convertTo: MovieCurrency;
  @Input() default: string | number = '-';

  public convertedCurrencies() { // TODO #9422 remove
    if (!this.convertTo) return false;
    return convertCurrenciesTo(this.price, this.convertTo)[this.convertTo];
  }
}

@Pipe({ name: 'formatPair' }) // TODO #9422 remove
export class FormatPairPipe implements PipeTransform {
  transform(amount: number, currency: MovieCurrency = mainCurrency): PricePerCurrency {
    return formatPair(amount, currency);
  }
}

// TODO #9422 remove
export function formatPair(amount: number, currency: MovieCurrency = mainCurrency): PricePerCurrency {
  return { [currency]: amount };
}
