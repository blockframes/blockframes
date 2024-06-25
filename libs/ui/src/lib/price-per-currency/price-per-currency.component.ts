import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { PricePerCurrency } from '@blockframes/model';

@Component({
  selector: '[price] price-per-currency',
  templateUrl: 'price-per-currency.component.html',
  styleUrls: ['./price-per-currency.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricePerCurrencyComponent {

  @Input() price: PricePerCurrency;
  @Input() default: string | number = '-';
}
