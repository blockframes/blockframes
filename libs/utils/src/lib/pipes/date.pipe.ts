import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, NgModule, LOCALE_ID, Inject } from '@angular/core';

@Pipe({ name: 'date' })
export class BfDatePipe extends DatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) locale: string) {
    super(locale);
  }

  transform(value: Date | string | number, format?: string, timezone?: string, locale?: string): string | null;
  transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
  transform(value: Date | string | number | null | undefined, format?: string, timezone?: string, locale?: string): string | null {
    if (!format || format === 'user') format = getUserDefaultDateFormat();
    return super.transform(value, format, timezone, locale);
  }
}

function getUserDefaultDateFormat() {
  switch (getUserLocaleId()) {
    case 'en-US':
      return 'MM/dd/yyyy';
    case 'fr-FR':
    case 'en-GB':
    default:
      return 'dd/MM/yyyy';
  }
}

export function getUserLocaleId(): string {
   // TODO #9699 add more locales
  switch (navigator.language) {
    case 'fr':
    case 'fr-FR':
      return 'fr-FR';
    case 'en-US':
      return 'en-US';
    case 'en-GB':
    case 'en':
    default:
      return 'en-GB';
  }
}

@NgModule({
  exports: [BfDatePipe],
  declarations: [BfDatePipe]
})
export class DatePipeModule { }
