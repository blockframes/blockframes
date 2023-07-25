import { getDate, getRightholderId, mandatoryError, wrongValueError } from '@blockframes/import/utils';
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
        /* a */ 'waterfallId': (value: string) => {
        if (!value) throw mandatoryError(value, 'Waterfall Id');
        return value;
      },
        /* b */ 'right.date': (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Date');
        return getDate(value, 'Right Date') as Date;
      },
        /* c */ 'right.id': (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Id');
        return value;
      },
        /* d */ 'right.actionName': (value: string) => {
        const lower = value.toLowerCase().trim();
        switch (lower) {
          case 'horizontal':
            return 'appendHorizontal';
          case 'vertical':
            return 'appendVertical';
          default:
            return 'append';
        }
      },
        /* e */ 'right.name': (value: string) => {
        return value;
      },
        /* f */ 'right.previousIds': (value: string) => {
        return value.split(separator).filter(v => !!v).map(v => v.trim());
      },
        /* g */ 'right.rightholderId': async (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Rightholder Id or Blame Id');
        const rightholderId = await getRightholderId(value, data.waterfallId, waterfallService, rightholderCache);
        if(data.right.actionName !== 'append') { 
          data.right.blameId = rightholderId;
          return '';
        } else {
          return rightholderId;
        }
      },
        /* h */ 'right.percent': (value: string) => {
        return Number(value);
      },
        /* i */ 'conditionA.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* j */ 'conditionA.left': (value: string) => {
        return value;
      },
        /* k */ 'conditionA.operator': (value: string) => {
        return value as NumberOperator;
      },
        /* l */ 'conditionA.target': (value: string) => {
        return isNumber(value) ? Number(value) : value;
      },
    };
  }

  return getAdminConfig();
}