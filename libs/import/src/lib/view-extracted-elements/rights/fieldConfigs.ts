import {
  getDate,
  getRightholderId,
  getTitleId,
  getWaterfallDocument,
  mandatoryError,
  optionalWarning,
  unknownEntityError,
  valueToId
} from '../../utils';
import {
  ConditionName,
  NumberOperator,
  Right,
  WaterfallRightholder,
  Movie,
  numberOperator,
  staticGroups,
  GroupScope,
  arrayOperator,
  ArrayOperator,
  TargetIn,
  targetIn,
  WaterfallDocument,
  ActionName
} from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

const isNumber = (v: string) => !isNaN(parseFloat(v));
export type ImportedTarget = {
  in: TargetIn | string | string[] | number
  id?: string;
  percent?: number;
};

export interface ImportedCondition {
  conditionName: ConditionName,
  left: string,
  operator: NumberOperator | ArrayOperator,
  target: ImportedTarget
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
  documentCache: Record<string, WaterfallDocument>,
}

interface RightConfig {
  waterfallService: WaterfallService,
  titleService: MovieService,
  waterfallDocumentsService: WaterfallDocumentsService,
  userOrgId: string,
  caches: Caches,
  separator: string,
}

export function getRightConfig(option: RightConfig) {
  const {
    waterfallService,
    titleService,
    waterfallDocumentsService,
    userOrgId,
    caches,
    separator
  } = option;

  const { rightholderCache, titleCache, documentCache } = caches;

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
        /* b */ 'right.name': (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Right name');

        // Create right ID from name
        data.right.id = valueToId(value);
        return value;
      },
        /* c */ 'right.percent': (value: string) => {
        if (!value.trim()) return 100;
        return Number(value);
      },
        /* d */ 'right.rightholderId': async (value: string, data: FieldsConfig) => {
        if (!value) return '';
        const rightholderId = await getRightholderId(value, data.waterfallId, waterfallService, rightholderCache);
        return rightholderId;
      },
        /* e */ 'right.actionName': (value: string, data: FieldsConfig) => {
        const actionName = getActionName(value);
        if (!data.right.rightholderId && actionName !== 'prependVertical') throw mandatoryError(data.right.rightholderId, 'Rightholder Name');
        if (actionName === 'prependHorizontal') data.right.blameId = data.right.rightholderId;
        if (['prependVertical', 'prependHorizontal'].includes(actionName)) delete data.right.rightholderId;
        return actionName;
      },
        /* f */ 'right.nextIds': (value: string) => {
        // ! Column on Excel file is called "Parent Names" (from waterfall top to bottom POV)
        return value.split(separator).map(valueToId).filter(v => !!v);
      },
        /* g */ 'right.groupId': (value: string) => {
        return valueToId(value);
      },
        /* h */ 'right.pools': (value: string) => {
        return value.split(separator).map(valueToId).filter(v => !!v);
      },
        /* i */ 'conditionA.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* j */ 'conditionA.left': (value: string) => {
        return valueToId(value);
      },
        /* k */ 'conditionA.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionA);
      },
        /* l */ 'conditionA.target.in': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionA);
      },
        /* m */ 'conditionA.target.id': (value: string, data: FieldsConfig) => {
        if (!value && targetIn.includes(data.conditionA.target.in as TargetIn)) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${data.conditionA.target.in}"`);
        return valueToId(value);
      },
        /* n */ 'conditionA.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* o */ 'conditionB.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* p */ 'conditionB.left': (value: string) => {
        return valueToId(value);
      },
        /* q */ 'conditionB.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionB);
      },
        /* r */ 'conditionB.target.in': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionB);
      },
        /* s */ 'conditionB.target.id': (value: string, data: FieldsConfig) => {
        if (!value && targetIn.includes(data.conditionB.target.in as TargetIn)) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${data.conditionB.target.in}"`);
        return valueToId(value);
      },
        /* t */ 'conditionB.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* u */ 'conditionC.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* v */ 'conditionC.left': (value: string) => {
        return valueToId(value);
      },
        /* w */ 'conditionC.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionC);
      },
        /* x */ 'conditionC.target.in': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionC);
      },
        /* y */ 'conditionC.target.id': (value: string, data: FieldsConfig) => {
        if (!value && targetIn.includes(data.conditionC.target.in as TargetIn)) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${data.conditionC.target.in}"`);
        return valueToId(value);
      },
        /* z */ 'conditionC.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* aa */ 'right.date': async (value: string, data: FieldsConfig, __, rowIndex) => {
        if (!value.trim()) return new Date(1 + (rowIndex * 1000)); // 01/01/1970 + "rowIndex" seconds 

        // If contract ID is specified instead of a date, we use signature date as right date.
        const contract = await getWaterfallDocument(value.trim(), waterfallDocumentsService, documentCache, data.waterfallId);
        if (contract) {
          data.right.contractId = contract.id;
          if (!contract.signatureDate) throw mandatoryError(value, 'Signature contract date', `Contract id "${contract.id}" is missing signature date.`);
          return contract.signatureDate;
        }

        return getDate(value, 'Right Date');
      },
    };
  }

  function extractConditionOperator(value: string, cond: ImportedCondition) {
    if (['terms', 'contract'].includes(cond.conditionName)) {
      if (value && !arrayOperator.includes(value as ArrayOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${arrayOperator.map(o => `"${o}"`).join(' ')}`);
      return value as ArrayOperator;
    } else if (cond.conditionName === 'interest') {
      if (value) throw optionalWarning('Operator should be left empty for "interest" conditions');
      return;
    } else if (cond.conditionName === 'event') {
      if (value === '≥') value = '>=';
      if (value && (numberOperator.includes(value as NumberOperator) || arrayOperator.includes(value as ArrayOperator))) {
        return numberOperator.includes(value as NumberOperator) ? value as NumberOperator : value as ArrayOperator;
      } else {
        throw mandatoryError(value, 'Operator', `Allowed values are : ${[...numberOperator, ...arrayOperator].map(o => `"${o}"`).join(' ')}`);
      }
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

  function getActionName(value: string): ActionName {
    switch (value.trim().toLowerCase()) {
      case 'horizontal':
      case 'horizontal group':
        return 'prependHorizontal';
      case 'vertical':
      case 'vertical group':
        return 'prependVertical';
      default:
        return 'prepend';
    }
  }

  return getAdminConfig();
}