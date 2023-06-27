import { Media, MovieCurrency, Territory } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getDate } from '@blockframes/import/utils';
import { getKeyIfExists } from '@blockframes/utils/helpers';

export interface FieldsConfig {
  income: {
    waterfallId: string;
    contractId: string;
    territories: Territory[];
    medias: Media[];
    id?: string;
    date: Date;
    price: number;
    currency: MovieCurrency;
  };
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface IncomeConfig {
  separator: string,
}

export function getIncomeConfig(option: IncomeConfig) {
  const { separator } = option;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'income.waterfallId': async (value: string) => {
        return value;
      },
        /* b */ 'income.contractId': async (value: string) => {
        return value;
      },
        /* c */ 'income.territories': (value: string) => getGroupedList(value, 'territories', separator),
        /* d */ 'income.medias': (value: string) => getGroupedList(value, 'medias', separator),
   
        /* e */ 'income.id': async (value: string) => {
        return value;
      },
        /* f */ 'income.date': async (value: string) => {
        return getDate(value, 'Income Date') as Date;
      },
        /* g */ 'income.price': async (value: string) => {
        return Number(value);
      },
        /* h */ 'income.currency': async (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
    };
  }

  return getAdminConfig();
}
