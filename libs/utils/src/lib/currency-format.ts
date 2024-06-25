import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { MovieCurrency, getUserLocaleId } from '@blockframes/model';

export function currencySymbol(currency: MovieCurrency) {
  return getCurrencySymbol(currency, 'wide', getUserLocaleId());
}

export function toCurrency(value: number, currency: MovieCurrency) {
  return formatCurrency(value, getUserLocaleId(), currencySymbol(currency));
}