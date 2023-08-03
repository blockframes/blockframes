import { RightsImportState, getDate } from '../../utils';
import {
  App,
  ArrayOperator,
  Condition,
  GroupScope,
  Movie,
  NumberOperator,
  TargetIn,
  TargetValue,
  WaterfallRightholder,
  createRight
} from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, ImportedCondition, getRightConfig } from './fieldConfigs';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MovieService } from '@blockframes/movie/service';

export interface FormatConfig {
  app: App;
}

export async function formatRight(
  sheetTab: SheetTab,
  waterfallService: WaterfallService,
  titleService: MovieService,
  userOrgId: string,
) {
  // Cache to avoid  querying db every time
  const rightholderCache: Record<string, WaterfallRightholder[]> = {};
  const titleCache: Record<string, Movie> = {};
  const caches = { rightholderCache, titleCache };

  const option = {
    waterfallService,
    titleService,
    userOrgId,
    caches,
    separator: ';'
  };

  const rights: RightsImportState[] = [];

  const fieldsConfig = getRightConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const right = createRight(data.right);

    if (data.conditionA?.conditionName) {
      right.conditions = {
        operator: 'AND',
        conditions: [formatCondition(data.conditionA)]
      }
    }

    if (data.conditionB?.conditionName) {
      right.conditions.conditions.push(formatCondition(data.conditionB));
    }

    if (data.conditionC?.conditionName) {
      right.conditions.conditions.push(formatCondition(data.conditionC));
    }

    rights.push({ waterfallId: data.waterfallId, right, errors, rightholders: rightholderCache });
  }
  return rights;
}

function formatCondition(cond: ImportedCondition): Condition {
  switch (cond.conditionName) {
    case 'rightRevenu': {
      return {
        name: 'rightRevenu',
        payload: {
          rightId: cond.left,
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'poolRevenu': {
      return {
        name: 'poolRevenu',
        payload: {
          pool: cond.left,
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'incomeDate':
    case 'contractDate': {
      const operator = cond.operator === '<' ? 'to' : 'from';
      return {
        name: cond.conditionName,
        payload: {
          [operator]: getDate(cond.target as string)
        }
      }
    }
    case 'contractAmount': {
      return {
        name: 'contractAmount',
        payload: {
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'contract': {
      return {
        name: 'contract',
        payload: {
          operator: cond.operator as ArrayOperator,
          contractIds: formatTarget(cond.target)
        }
      }
    }
    case 'terms': {
      return {
        name: 'terms',
        payload: {
          operator: cond.operator as ArrayOperator,
          type: cond.left as GroupScope,
          list: formatTarget(cond.target)
        }
      }
    }
    default:
      break;
  }
}

function formatTarget<T extends TargetValue | number | string[]>(target: string | string[] | number = ''): T {
  if (!isNaN(target as number) || Array.isArray(target)) return target as T;
  const [tar, id, percent] = (target as string).split(':');
  return {
    in: tar as TargetIn,
    id,
    percent: parseFloat(percent) / 100 || 1
  } as T;
}