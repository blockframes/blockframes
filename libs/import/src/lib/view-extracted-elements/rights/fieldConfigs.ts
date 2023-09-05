import { getDate, getRightholderId, getTitleId, getWaterfallDocument, mandatoryError, optionalWarning, unknownEntityError } from '../../utils';
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
  WaterfallDocument
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
        /* b */ 'right.date': async (value: string, data: FieldsConfig, __, rowIndex) => {
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
        /* c */ 'right.id': (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Id');
        return value;
      },
        /* d */ 'right.groupId': (value: string) => {
        return value;
      },
        /* e */ 'right.nextIds': (value: string) => {
        // ! Column on Excel file is called Previous (from waterfall top to bottom POV)
        return value.split(separator).map(v => v.trim()).filter(v => !!v);
      },
        /* f */ 'right.previousIds': (value: string) => {
        // ! Column on Excel file is called Next (from waterfall top to bottom POV)
        return value.split(separator).map(v => v.trim()).filter(v => !!v);
      },
        /* g */ 'right.actionName': (value: string, data: FieldsConfig) => {
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
        /* h */ 'right.name': (value: string) => {
        return value;
      },
        /* i */ 'right.rightholderId': async (value: string, data: FieldsConfig) => {
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
        /* j */ 'right.percent': (value: string) => {
        return Number(value);
      },
        /* k */ 'right.pools': (value: string) => {
        return value.split(separator).map(v => v.trim()).filter(v => !!v);
      },
        /* l */ 'conditionA.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* m */ 'conditionA.left': (value: string) => {
        return value.trim();
      },
        /* n */ 'conditionA.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionA);
      },
        /* o */ 'conditionA.target.in': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionA);
      },
        /* p */ 'conditionA.target.id': (value: string, data: FieldsConfig) => {
        if (!value && targetIn.includes(data.conditionA.target.in as TargetIn)) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${data.conditionA.target.in}"`);
        return value.trim();
      },
        /* q */ 'conditionA.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* r */ 'conditionB.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* s */ 'conditionB.left': (value: string) => {
        return value.trim();
      },
        /* t */ 'conditionB.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionB);
      },
        /* u */ 'conditionB.target.in': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionB);
      },
        /* v */ 'conditionB.target.id': (value: string, data: FieldsConfig) => {
        if (!value && targetIn.includes(data.conditionB.target.in as TargetIn)) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${data.conditionB.target.in}"`);
        return value.trim();
      },
        /* w */ 'conditionB.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* x */ 'conditionC.conditionName': (value: string) => {
        return value as ConditionName;
      },
        /* y */ 'conditionC.left': (value: string) => {
        return value.trim();
      },
        /* z */ 'conditionC.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionC);
      },
        /* aa */ 'conditionC.target.in': (value: string, data: FieldsConfig) => {
        return extractConditionTarget(value, data.conditionC);
      },
        /* ab */ 'conditionC.target.id': (value: string, data: FieldsConfig) => {
        if (!value && targetIn.includes(data.conditionC.target.in as TargetIn)) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${data.conditionC.target.in}"`);
        return value.trim();
      },
        /* ac */ 'conditionC.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
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

  return getAdminConfig();
}