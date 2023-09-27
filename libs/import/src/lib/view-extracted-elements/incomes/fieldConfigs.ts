import { Media, MovieCurrency, Territory, Movie } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getDate, getTitleId, mandatoryError, optionalWarning, unknownEntityError, valueToId } from '../../utils';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { MovieService } from '@blockframes/movie/service';

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

type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  titleCache: Record<string, Movie>,
}

interface IncomeConfig {
  titleService: MovieService,
  userOrgId: string,
  caches: Caches,
  separator: string,
}

export function getIncomeConfig(option: IncomeConfig) {
  const {
    titleService,
    userOrgId,
    caches,
    separator
  } = option;

  const { titleCache } = caches;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'income.titleId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall ID');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'Waterfall name or ID');
      },
        /* b */ 'income.contractId': (value: string) => {
        if (!value) throw optionalWarning('Contract ID');
        return value;
      },
        /* c */ 'income.sourceId': (value: string) => {
        return valueToId(value);
      },
        /* d */ 'income.territories_included': (value: string, data: FieldsConfig) => getGroupedList(value, 'territories', separator, { required: !data.income.sourceId }),
        /* e */ 'income.territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'income.medias': (value: string, data: FieldsConfig) => getGroupedList(value, 'medias', separator, { required: !data.income.sourceId }),

        /* g */ 'income.id': (value: string) => {
        return value;
      },
        /* h */ 'income.date': (value: string) => {
        if (!value) throw mandatoryError(value, 'Date');
        return getDate(value, 'Income Date');
      },
        /* i */ 'income.price': (value: string) => {
        if (!value) return 0;
        return Number(value);
      },
        /* j */ 'income.currency': (value: string): MovieCurrency => {
        if (value?.trim() === '€') return 'EUR';
        if (value?.trim() === '$') return 'USD';
        if (value?.trim() === '£') return 'GBP';
        const currency = getKeyIfExists('movieCurrencies', value);
        if (!currency) throw mandatoryError(value, 'Currency');
        return currency;
      },
    };
  }

  return getAdminConfig();
}
