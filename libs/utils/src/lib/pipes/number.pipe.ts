import { formatCurrency, formatNumber, getCurrencySymbol } from '@angular/common';
import { Pipe, PipeTransform, NgModule, DEFAULT_CURRENCY_CODE, Inject, LOCALE_ID } from '@angular/core';

// Code from : https://github.com/angular/angular/blob/10.1.5/packages/common/src/pipes/number_pipe.ts#L256
function strToNumber(value: number|string): number {
  // Convert strings to numbers
  if (typeof value === 'string' && !isNaN(Number(value) - parseFloat(value))) {
    return Number(value);
  }
  if (typeof value !== 'number') {
    throw new Error(`${value} is not a number`);
  }
  return value;
}

/** 
 * Add symbol if it can be divided 10 time by the symbol
 * @example 27_500 -> 27.50K
 * @example 1_250 -> 1_250
 */
function toBigNumber(value: number) {
  if (value / 10_000 > 1) {
    return { result: value / 1_000, symbol: 'K'};
  } else if (value / 10_000_000 > 1) {
    return { result: value / 1_000_000, symbol: 'M' };
  } else {
    return { result: value, symbol: '' };
  }
}

// todo(#3967) Make it work with € also. Right now it does 1.25€K instead of 1.25K€
@Pipe({ name: 'bigNumber' })
export class BigNumberPipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) private _locale: string,
  ) {}

  transform(value: number, digitInfo: string) {
    if (value === null || value === undefined) return '';
    const locale = this._locale;
    const num = strToNumber(value);
    const { result, symbol } = toBigNumber(num);
    return `${formatNumber(result, locale, digitInfo)}${symbol}`;
  }
}


@Pipe({ name: 'bigCurrency' })
export class BigCurrencyPipe implements PipeTransform {
  constructor(
    @Inject(LOCALE_ID) private _locale: string,
    @Inject(DEFAULT_CURRENCY_CODE) private _defaultCurrencyCode: string = 'USD'
  ) {}

  transform(value: number, currencyCode: string = this._defaultCurrencyCode) {
    if (value === null || value === undefined) return '';
    const locale = this._locale;
    const currency = getCurrencySymbol(currencyCode, 'wide', locale);
    const num = strToNumber(value);
    const { result, symbol } = toBigNumber(num);
    return `${formatCurrency(result, locale, currency, currencyCode)}${symbol}`;
  }
}

@NgModule({
  declarations: [BigNumberPipe, BigCurrencyPipe],
  exports: [BigNumberPipe, BigCurrencyPipe],
})
export class NumberPipeModule {}
