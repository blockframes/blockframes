import { staticModels } from '@blockframes/utils/static-model';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { ContractVersionPriceForm } from './price.form';

@Component({
  selector: '[form] contract-version-form-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PriceComponent {
  @Input() form: ContractVersionPriceForm;

  public staticCurrencies = staticModels.MOVIE_CURRENCIES;

}
