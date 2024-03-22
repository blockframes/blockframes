import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform, NgModule, LOCALE_ID, Inject } from '@angular/core';
import { getUserDefaultDateFormat } from '../date-adapter';

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

@NgModule({
  exports: [BfDatePipe],
  declarations: [BfDatePipe]
})
export class DatePipeModule { }
