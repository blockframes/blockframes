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
        /* a */ 'expense.titleId': async (value: string) => {
        return value;
      },
        /* b */ 'expense.contractId': async (value: string) => {
        return value;
      },
        /* c */ 'expense.id': async (value: string) => {
        return value;
      },
        /* d */ 'expense.date': async (value: string) => {
        return getDate(value, 'Income Date') as Date;
      },
        /* e */ 'expense.price': async (value: string) => {
        return Number(value);
      },
        /* f */ 'expense.currency': async (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
        /* g */ 'expense.type': async (value: string) => {
        return value;
      },
        /* h */ 'expense.category': async (value: string) => {
        return value;
      },
    };
  }

  return getAdminConfig();
}
