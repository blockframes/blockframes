import { RightsImportState, getDate } from '../../utils';
import {
  Amortization,
  App,
  ArrayOperator,
  Condition,
  GroupScope,
  Movie,
  NumberOperator,
  TargetValue,
  WaterfallDocument,
  WaterfallRightholder,
  createRight
} from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, ImportedCondition, ImportedTarget, getRightConfig } from './fieldConfigs';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { AmortizationService } from '@blockframes/waterfall/amortization.service';

export interface FormatConfig {
  app: App;
}

export async function formatRight(
  sheetTab: SheetTab,
  waterfallService: WaterfallService,
  titleService: MovieService,
  waterfallDocumentsService: WaterfallDocumentsService,
  amortizationService: AmortizationService,
  userOrgId: string,
) {
  // Cache to avoid  querying db every time
  const rightholderCache: Record<string, WaterfallRightholder[]> = {};
  const titleCache: Record<string, Movie> = {};
  const documentCache: Record<string, WaterfallDocument> = {};
  const amortizationCache: Record<string, Amortization[]> = {};
  const caches = { rightholderCache, titleCache, documentCache, amortizationCache };

  const option = {
    waterfallService,
    titleService,
    waterfallDocumentsService,
    amortizationService,
    userOrgId,
    caches,
    separator: ';'
  };

  const rights: RightsImportState[] = [];

  const fieldsConfig = getRightConfig(option);
  const rows = sheetTab.rows.filter(r => r.some(c => !!c)); // Remove empty rows

  const results = await extract<FieldsConfig>(rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const right = createRight(data.right);

    if (data.conditionA?.conditionName || data.conditionB?.conditionName || data.conditionC?.conditionName) {
      right.conditions = {
        operator: 'AND',
        conditions: []
      }
    }

    if (data.conditionA?.conditionName) {
      right.conditions.conditions.push(formatCondition(data.conditionA, rightholderCache[data.waterfallId]));
    }

    if (data.conditionB?.conditionName) {
      right.conditions.conditions.push(formatCondition(data.conditionB, rightholderCache[data.waterfallId]));
    }

    if (data.conditionC?.conditionName) {
      right.conditions.conditions.push(formatCondition(data.conditionC, rightholderCache[data.waterfallId]));
    }

    rights.push({ waterfallId: data.waterfallId, right, errors, rightholders: rightholderCache, amortizations: amortizationCache });
  }
  return rights;
}

function formatCondition(cond: ImportedCondition, rightholders: WaterfallRightholder[]): Condition {
  switch (cond.conditionName) {
    case 'orgRevenu':
    case 'orgTurnover': {
      return {
        name: cond.conditionName,
        payload: {
          orgId: rightholders.find(r => r.id === cond.left).id,
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'rightRevenu':
    case 'rightTurnover': {
      return {
        name: cond.conditionName,
        payload: {
          rightId: cond.left,
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'poolRevenu':
    case 'poolTurnover':
    case 'poolShadowRevenu': {
      return {
        name: cond.conditionName,
        payload: {
          pool: cond.left,
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'groupRevenu':
    case 'groupTurnover': {
      return {
        name: cond.conditionName,
        payload: {
          groupId: cond.left,
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
          [operator]: getDate(cond.target.in as string)
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
    case 'interest': {
      return {
        name: 'interest',
        payload: {
          orgId: cond.left,
          contractId: cond.target.id,
          operator: cond.operator as NumberOperator,
          percent: cond.target.percent,
          rate: cond.interest.rate,
          isComposite: cond.interest.isComposite
        }
      }
    }
    case 'filmAmortized': {
      return {
        name: 'filmAmortized',
        payload: {
          operator: cond.operator as NumberOperator,
          target: formatTarget(cond.target)
        }
      }
    }
    case 'event': {
      return {
        name: 'event',
        payload: {
          eventId: cond.left,
          operator: cond.operator,
          value: formatTarget(cond.target)
        }
      }
    }
    default:
      break;
  }
}

function formatTarget<T extends TargetValue | number | string[]>(target: ImportedTarget): T {
  if (!isNaN(target.in as number) || Array.isArray(target.in)) return target.in as T;
  return target as T;
}