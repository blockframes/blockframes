import { MovieCurrency } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getDate } from '@blockframes/import/utils';
import { getKeyIfExists } from '@blockframes/utils/helpers';

export interface FieldsConfig {
  expense: {
    titleId: string;
    contractId: string;
    id?: string;
    date: Date;
    price: number;
    currency: MovieCurrency;
    type: string;
    category: string;
  };
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

export function getExpenseConfig() {

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'expense.titleId': (value: string) => {
        return value;
      },
        /* b */ 'expense.contractId': (value: string) => {
        return value;
      },
        /* c */ 'expense.id': (value: string) => {
        return value;
      },
        /* d */ 'expense.date': (value: string) => {
        return getDate(value, 'Income Date') as Date;
      },
        /* e */ 'expense.price': (value: string) => {
        return Number(value);
      },
        /* f */ 'expense.currency': (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
        /* g */ 'expense.type': (value: string) => {
        return value;
      },
        /* h */ 'expense.category': (value: string) => {
        return value;
      },
    };
  }

  return getAdminConfig();
}
