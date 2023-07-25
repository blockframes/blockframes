import { RightsImportState } from '@blockframes/import/utils';
import { ActionName, App, Condition, TargetIn, TargetValue, WaterfallRightholder, createRight } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, ImportedCondition, getRightConfig } from './fieldConfigs';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

export interface FormatConfig {
  app: App;
}

export async function formatRight(
  sheetTab: SheetTab,
  waterfallService: WaterfallService,
) {
  // Cache to avoid  querying db every time
  const rightholderCache: Record<string, WaterfallRightholder[]> = {};
  const caches = { rightholderCache };

  const option = {
    waterfallService,
    caches,
    separator: ';'
  };

  const rights: RightsImportState[] = [];

  const fieldsConfig = getRightConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const right = createRight(data.right);

    if (data.conditionA.conditionName) {
      right.conditions = {
        operator: 'AND',
        conditions: [formatCondition(data.conditionA)]
      }
    }

    rights.push({ waterfallId: data.waterfallId, right, errors, rightholders: rightholderCache });
  }
  return rights;
}

function formatCondition(cond: ImportedCondition): Condition {
  switch (cond.conditionName) {
    case 'rightRevenu':
      return {
        name: 'rightRevenu',
        payload: {
          rightId: cond.left,
          operator: cond.operator,
          target: formatTarget(cond.target)
        }
      }
    default:
      break;
  }
}

function formatTarget(target: string | number): TargetValue {
  if (!isNaN(target as number)) return target as number;
  const [tar, id, percent] = (target as string).split(':');
  return {
    in: tar as TargetIn,
    id,
    percent: parseFloat(percent) || 1
  }
}