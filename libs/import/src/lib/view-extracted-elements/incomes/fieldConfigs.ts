import { Media, MovieCurrency, Territory } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getDate } from '@blockframes/import/utils';
import { getKeyIfExists } from '@blockframes/utils/helpers';

export interface FieldsConfig {
  income: {
    titleId: string;
    contractId: string;
    territories_included: Territory[];
    territories_excluded: Territory[];
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
        /* a */ 'income.titleId': async (value: string) => {
        return value;
      },
        /* b */ 'income.contractId': async (value: string) => {
        return value;
      },
        /* c */ 'income.territories_included': (value: string) => getGroupedList(value, 'territories', separator),
        /* d */ 'income.territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* e */ 'income.medias': (value: string) => getGroupedList(value, 'medias', separator),

        /* f */ 'income.id': async (value: string) => {
        return value;
      },
        /* g */ 'income.date': async (value: string) => {
        return getDate(value, 'Income Date') as Date;
      },
        /* h */ 'income.price': async (value: string) => {
        return Number(value);
      },
        /* i */ 'income.currency': async (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
    };
  }

  return getAdminConfig();
}
