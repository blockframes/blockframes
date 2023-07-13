import { getDate, getRightholderId, mandatoryError } from '@blockframes/import/utils';
import { ConditionName, NumberOperator, Right, WaterfallRightholder } from '@blockframes/model';
import { ExtractConfig } from '@blockframes/utils/spreadsheet';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

const isNumber = (v: string) => !isNaN(parseFloat(v));
export interface ImportedCondition {
  conditionName: ConditionName,
  left: string,
  operator: NumberOperator,
  target: string | number
}

export interface FieldsConfig {
  waterfallId: string;
  right: Omit<Right, 'conditions'>;
  conditionA?: ImportedCondition;
  conditionB?: ImportedCondition;
  conditionC?: ImportedCondition;
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  rightholderCache: Record<string, WaterfallRightholder[]>,
}

interface RightConfig {
  waterfallService: WaterfallService,
  caches: Caches,
  separator: string,
}

export function getRightConfig(option: RightConfig) {
  const {
    waterfallService,
    caches,
    separator
  } = option;

  const { rightholderCache } = caches;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'waterfallId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Waterfall Id');
        return value;
      },
        /* b */ 'right.date': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Date');
        return getDate(value, 'Right Date') as Date;
      },
        /* c */ 'right.groupId': async (value: string) => {
        return value;
      },
        /* d */ 'right.groupPercent': async (value: string) => {
        return Number(value);
      },
        /* e */ 'right.id': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Id');
        return value;
      },
        /* f */ 'right.name': async (value: string) => {
        return value;
      },
        /* g */ 'right.previousIds': async (value: string) => {
        return value.split(separator).filter(v => !!v).map(v => v.trim());
      },
        /* h */ 'right.rightholderId': async (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        const rightholderId = await getRightholderId(value, data.waterfallId, waterfallService, rightholderCache);
        return rightholderId;
      },
        /* i */ 'right.percent': async (value: string) => {
        return Number(value);
      },
        /* j */ 'conditionA.conditionName': async (value: string) => {
        return value as ConditionName;
      },
        /* k */ 'conditionA.left': async (value: string) => {
        return value;
      },
        /* l */ 'conditionA.operator': async (value: string) => {
        return value as NumberOperator;
      },
        /* m */ 'conditionA.target': async (value: string) => {
        return isNumber(value) ? Number(value) : value;
      },
    };
  }

  return getAdminConfig();
}