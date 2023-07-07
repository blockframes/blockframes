import { Media, MovieCurrency, Territory } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getDate } from '@blockframes/import/utils';
import { getKeyIfExists } from '@blockframes/utils/helpers';

export interface FieldsConfig {
  income: {
    titleId: string;
    contractId: string;
    sourceId: string;
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
        /* c */ 'income.sourceId': async (value: string) => {
        return value;
      },
        /* d */ 'income.territories_included': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* e */ 'income.territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'income.medias': (value: string) => getGroupedList(value, 'medias', separator, { required: false }),

        /* g */ 'income.id': async (value: string) => {
        return value;
      },
        /* h */ 'income.date': async (value: string) => {
        return getDate(value, 'Income Date') as Date;
      },
        /* i */ 'income.price': async (value: string) => {
        return Number(value);
      },
        /* j */ 'income.currency': async (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        return currency;
      },
    };
  }

  return getAdminConfig();
}
