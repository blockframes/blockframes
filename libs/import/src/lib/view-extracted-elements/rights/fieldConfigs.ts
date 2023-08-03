import { getDate, getRightholderId, getTitleId, mandatoryError, optionalWarning, unknownEntityError } from '../../utils';
import { ConditionName, NumberOperator, Right, WaterfallRightholder, Movie, numberOperator, staticGroups, GroupScope, arrayOperator, ArrayOperator } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

const isNumber = (v: string) => !isNaN(parseFloat(v));
export interface ImportedCondition {
  conditionName: ConditionName,
  left: string,
  operator: NumberOperator | ArrayOperator,
  target: string | string[] | number
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
  titleCache: Record<string, Movie>,
}

interface RightConfig {
  waterfallService: WaterfallService,
  titleService: MovieService,
  userOrgId: string,
  caches: Caches,
  separator: string,
}

export function getRightConfig(option: RightConfig) {
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
        /* a */ 'waterfallId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall ID');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'Waterfall name or ID');
      },
        /* b */ 'right.date': (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Date');
        return getDate(value, 'Right Date');
      },
        /* c */ 'right.id': (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Id');
        return value;
      },
        /* d */ 'right.groupId': (value: string) => {
        return value;
      },
        /* e */ 'right.order': (value: string) => {
        if (!value) return;
        return Number(value);
      },
        /* f */ 'right.nextIds': (value: string) => {
        // ! Column on Excel file is called Previous (from waterfall top to bottom POV)
        return value.split(separator).map(v => v.trim()).filter(v => !!v);
      },
        /* g */ 'right.previousIds': (value: string) => {
        // ! Column on Excel file is called Next (from waterfall top to bottom POV)
        return value.split(separator).map(v => v.trim()).filter(v => !!v);
      },
        /* h */ 'right.actionName': (value: string, data: FieldsConfig) => {
        const lower = value.toLowerCase().trim();
        switch (lower) {
          case 'horizontal':
            return data.right.nextIds.length ? 'prependHorizontal' : 'appendHorizontal';
          case 'vertical':
            return data.right.nextIds.length ? 'prependVertical' : 'appendVertical';
          default:
            return data.right.nextIds.length ? 'prepend' : 'append';
        }
      },
        /* i */ 'right.name': (value: string) => {
        return value;
      },
        /* j */ 'right.rightholderId': async (value: string, data: FieldsConfig) => {
        if (['appendVertical', 'prependVertical'].includes(data.right.actionName)) {
          if (value) throw optionalWarning('Rightholder Id or Blame Id should be left empty for vertical groups');
          return '';
        }
        if (!value) throw mandatoryError(value, 'Rightholder Id or Blame Id');
        const rightholderId = await getRightholderId(value, data.waterfallId, waterfallService, rightholderCache);
        if (['appendHorizontal', 'prependHorizontal'].includes(data.right.actionName)) {
          data.right.blameId = rightholderId;
          return '';
        } else {
          return rightholderId;
        }
      },
        /* k */ 'right.percent': (value: string) => {
        return Number(value);
      },
        /* l */ 'right.pools': (value: string) => {
        return value.split(separator).map(v => v.trim()).filter(v => !!v);
      },
        /* m */ 'conditionA.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* n */ 'conditionA.left': (value: string) => {
        return value.trim();
      },
        /* o */ 'conditionA.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionA);
      },
        /* p */ 'conditionA.target': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionA);
      },
        /* q */ 'conditionB.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* r */ 'conditionB.left': (value: string) => {
        return value.trim();
      },
        /* s */ 'conditionB.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionB);
      },
        /* t */ 'conditionB.target': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionB);
      },
        /* u */ 'conditionC.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* v */ 'conditionC.left': (value: string) => {
        return value.trim();
      },
        /* w */ 'conditionC.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionC);
      },
        /* x */ 'conditionC.target': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionC);
      },
    };
  }

  function extractConditionOperator(value: string, cond: ImportedCondition) {
    if (['terms', 'contract'].includes(cond.conditionName)) {
      if (value && !arrayOperator.includes(value as ArrayOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${arrayOperator.map(o => `"${o}"`).join(' ')}`);
      return value as ArrayOperator;
    } else {
      if (value === '≥') value = '>=';
      if (value && !numberOperator.includes(value as NumberOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${numberOperator.map(o => `"${o}"`).join(' ')}`);
      return value as NumberOperator;
    }
  }

  function extractConditionTarget(value: string, cond: ImportedCondition) {
    if (cond.conditionName === 'terms') {
      const groups = Object.keys(staticGroups) as GroupScope[];
      const leftOperand = cond.left as any;
      if (!groups.includes(leftOperand)) throw mandatoryError(value, 'Operator', `For "terms" condition, expected value for left operand are : ${groups.map(g => `"${g}"`).join(' ')}`);
      return getGroupedList(value, leftOperand, separator);
    } else if (cond.conditionName === 'contract') {
      return value.split(separator).map(v => v.trim()).filter(v => !!v);
    } else {
      return isNumber(value) ? Number(value) : value;
    }
  }

  return getAdminConfig();
}