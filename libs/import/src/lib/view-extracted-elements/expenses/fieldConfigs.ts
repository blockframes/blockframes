import { MovieCurrency, Movie } from '@blockframes/model';
import { ExtractConfig } from '@blockframes/utils/spreadsheet';
import { getDate, getTitleId, mandatoryError, unknownEntityError } from '@blockframes/import/utils';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { MovieService } from '@blockframes/movie/service';

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

type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  titleCache: Record<string, Movie>,
}

interface ExpenseConfig {
  titleService: MovieService,
  userOrgId: string,
  caches: Caches,
}

export function getExpenseConfig(option: ExpenseConfig) {
  const {
    titleService,
    userOrgId,
    caches,
  } = option;

  const { titleCache } = caches;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'expense.titleId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall ID');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'Waterfall name or ID');
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
