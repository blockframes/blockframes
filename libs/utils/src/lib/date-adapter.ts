import { NativeDateAdapter } from '@angular/material/core';
import { format, parse } from 'date-fns';
import '@angular/localize/init';
import { getUserLocaleId } from '@blockframes/model';

/**
 * @dev adapted from https://stackblitz.com/edit/angular-datepicker-custom-adapter?file=app%2Fdate-adapter.component.ts
 */
export class BlockframesDateAdapter extends NativeDateAdapter {
  format(date: Date): string {
    return format(date, getUserDefaultDateFormat());
  }

  parse(value: any): Date | null {
    if (!value) return null;
    return parse(value, getUserDefaultDateFormat(), new Date());
  }
}

export function getUserDefaultDateFormat() {
  switch (getUserLocaleId()) {
    case 'en-US':
      return 'MM/dd/yyyy';
    case 'fr-FR':
    case 'en-GB':
    default:
      return 'dd/MM/yyyy';
  }
}

export const dateInputFormat = getUserDefaultDateFormat().toUpperCase();