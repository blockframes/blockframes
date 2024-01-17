import { Component, Input, ChangeDetectionStrategy, Pipe, PipeTransform } from '@angular/core';
import { MovieCurrency, PricePerCurrency, convertCurrenciesTo, mainCurrency } from '@blockframes/model';

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

  public convertedCurrencies() {
    if (!this.convertTo) return false;
    return convertCurrenciesTo(this.price, this.convertTo)[this.convertTo];
  }
}

@Pipe({ name: 'formatPair' })
export class FormatPairPipe implements PipeTransform {
  transform(amount: number, currency: MovieCurrency = mainCurrency): PricePerCurrency {
    return formatPair(amount, currency);
  }
}

export function formatPair(amount: number, currency: MovieCurrency = mainCurrency): PricePerCurrency {
  return { [currency]: amount };
}
