import { getDate, getRightholderId, getTitleId, mandatoryError, optionalWarning, unknownEntityError } from '../../utils';
import { ConditionName, NumberOperator, Right, WaterfallRightholder, Movie, numberOperator } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
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
        if (data.right.actionName === 'appendVertical') {
          if (value) throw optionalWarning('Rightholder Id or Blame Id should be left empty for vertical groups');
          return '';
        }
        if (!value) throw mandatoryError(value, 'Rightholder Id or Blame Id');
        const rightholderId = await getRightholderId(value, data.waterfallId, waterfallService, rightholderCache);
        if (data.right.actionName === 'appendHorizontal') {
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
        if (value === '≥') value = '>=';
        if (value && !numberOperator.includes(value as NumberOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${numberOperator.map(o => `"${o}"`).join(' ')}`);
        return value as NumberOperator;
      },
        /* l */ 'conditionA.target': (value: string) => {
        return isNumber(value) ? Number(value) : value;
      },
        /* m */ 'conditionB.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* n */ 'conditionB.left': (value: string) => {
        return value;
      },
        /* o */ 'conditionB.operator': (value: string) => {
        if (value === '≥') value = '>=';
        if (value && !numberOperator.includes(value as NumberOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${numberOperator.map(o => `"${o}"`).join(' ')}`);
        return value as NumberOperator;
      },
        /* p */ 'conditionB.target': (value: string) => {
        return isNumber(value) ? Number(value) : value;
      },
    };
  }

  return getAdminConfig();
}