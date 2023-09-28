import { Expense, Media, Movie, MovieCurrency, Statement, Territory, WaterfallRightholder } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { getRightholderId, getTitleId, mandatoryError, optionalWarning, unknownEntityError, getDate, wrongValueError, valueToId } from '../../utils';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { getKeyIfExists } from '@blockframes/utils/helpers';

export interface FieldsConfig {
  statement: Statement;
  incomes: {
    sourceId: string;
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    id?: string;
    price: number;
    currency: MovieCurrency;
    salesContractId: string;
  }[];
  expenses: Expense[];
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  titleCache: Record<string, Movie>,
  rightholderCache: Record<string, WaterfallRightholder[]>,
}

interface StatementConfig {
  waterfallService: WaterfallService,
  titleService: MovieService,
  userOrgId: string,
  caches: Caches,
  separator: string,
}

export function getStatementConfig(option: StatementConfig) {
  const {
    waterfallService,
    titleService,
    userOrgId,
    caches,
    separator
  } = option;

  const { rightholderCache, titleCache } = caches;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'statement.waterfallId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall ID');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'Waterfall name or ID');
      },
        /* b */ 'statement.contractId': (value: string) => {
        if (!value) throw optionalWarning('Contract ID');
        return value;
      },
        /* c */ 'statement.id': async (value: string) => {
        return value;
      },
        /* d */ 'statement.rightholderId': async (value: string, data: FieldsConfig) => {
        if (!value) return '';
        const rightholderId = await getRightholderId(value, data.statement.waterfallId, waterfallService, rightholderCache);
        return rightholderId;
      },
        /* e */ 'statement.duration.from': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Date');
        return getDate(value, 'From Date');
      },
        /* f */ 'statement.duration.to': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Date');
        return getDate(value, 'To Date');
      },
        /* g */ 'statement.type': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Statement type');
        const type = getKeyIfExists('rightholderRoles', value);
        if (!type) throw wrongValueError(value, 'Statement type');
        return type;
      },
        /* h */ 'incomes[].id': (value: string) => {
        // TODO #9493 check if id is unique
        return value.trim();
      },
        /* i */ 'incomes[].sourceId': (value: string) => {
        return valueToId(value);
      },
        /* j */ 'incomes[].territories_included': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* k */ 'incomes[].territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* l */ 'incomes[].medias': (value: string) => getGroupedList(value, 'medias', separator, { required: false }),
        /* m */ 'incomes[].price': (value: string) => {
        if (!value) return 0;
        return Number(value);
      },
        /* n */ 'incomes[].currency': (value: string): MovieCurrency => {
        return getCurrency(value);
      },
        /* o */ 'incomes[].salesContractId': (value: string) => {
        return value;
      },
        /* p */ 'expenses[].id': (value: string) => {
          // TODO #9493 check if id is unique
        return value.trim();
      },
        /* q */ 'expenses[].price': (value: string) => {
        return Number(value);
      },
        /* r */ 'expenses[].currency': (value: string): MovieCurrency => {
        return getCurrency(value);
      },
        /* s */ 'expenses[].type': (value: string) => {
        return value.trim();
      },
        /* t */ 'expenses[].category': (value: string) => {
        return value.trim();
      },
    };
  }

  function getCurrency(value: string) {
    if (value?.trim() === '€') return 'EUR';
    if (value?.trim() === '$') return 'USD';
    if (value?.trim() === '£') return 'GBP';
    const currency = getKeyIfExists('movieCurrencies', value);
    if (!currency) throw mandatoryError(value, 'Currency');
    return currency;
  }

  return getAdminConfig();
}
