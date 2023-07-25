import { Media, MovieCurrency, Territory } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getDate, mandatoryError } from '@blockframes/import/utils';
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
        /* a */ 'income.titleId': (value: string) => {
        if (!value) throw mandatoryError(value, 'Waterfall Id');
        return value;
      },
        /* b */ 'income.contractId': (value: string) => {
        if (!value) throw mandatoryError(value, 'Contract Id');
        return value;
      },
        /* c */ 'income.sourceId': (value: string) => {
        return value;
      },
        /* d */ 'income.territories_included': (value: string, data: FieldsConfig) => getGroupedList(value, 'territories', separator, { required: !data.income.sourceId }),
        /* e */ 'income.territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'income.medias': (value: string, data: FieldsConfig) => getGroupedList(value, 'medias', separator, { required: !data.income.sourceId }),

        /* g */ 'income.id': (value: string) => {
        return value;
      },
        /* h */ 'income.date': (value: string) => {
        if (!value) throw mandatoryError(value, 'Date');
        return getDate(value, 'Income Date') as Date;
      },
        /* i */ 'income.price': (value: string) => {
        if (!value) return 0;
        return Number(value);
      },
        /* j */ 'income.currency': (value: string) => {
        const currency = getKeyIfExists('movieCurrencies', value);
        if (!currency) throw mandatoryError(value, 'Currency');
        return currency;
      },
    };
  }

  return getAdminConfig();
}
