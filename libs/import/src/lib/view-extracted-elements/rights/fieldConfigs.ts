import {
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
  ActionName,
  conditionNames,
  RightType,
  isContract
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
        /* b */ 'right.name': (value: string, data: FieldsConfig, _, rowIndex) => {
        if (!value) throw mandatoryError(value, 'Right name');

        // Save right order in Excel file (used for vertical group childs)
        data.right.order = rowIndex;

        // Create right ID from name
        data.right.id = valueToId(value);
        return value;
      },
        /* c */ 'right.percent': (value: string) => {
        if (!value.trim()) return 100;
        return Number(value.replace(',', '.'));
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

        // Column is also used to set type of right
        data.right.type = getRightType(value);
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
        // TODO #9502 if current row is a group, apply to each childs of the group
        return value.split(separator).map(valueToId).filter(v => !!v);
      },
        /* i */ 'conditionA.conditionName': (value: string) => {
        return getConditionName(value);
      },
        /* j */ 'conditionA.left': (value: string, data: FieldsConfig) => {
        return extractConditionLeft(value, data.waterfallId, data.conditionA.conditionName);
      },
        /* k */ 'conditionA.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionA);
      },
        /* l */ 'conditionA.target.in': (value: string) => {
        return extractConditionTargetIn(value);
      },
        /* m */ 'conditionA.target.id': (value: string, data: FieldsConfig) => {
        return extractConditionTargetId(value, data.conditionA);
      },
        /* n */ 'conditionA.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* o */ 'conditionB.conditionName': (value: string) => {
        return getConditionName(value);
      },
        /* p */ 'conditionB.left': (value: string, data: FieldsConfig) => {
        return extractConditionLeft(value, data.waterfallId, data.conditionB.conditionName);
      },
        /* q */ 'conditionB.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionB);
      },
        /* r */ 'conditionB.target.in': (value: string) => {
        return extractConditionTargetIn(value);
      },
        /* s */ 'conditionB.target.id': (value: string, data: FieldsConfig) => {
        return extractConditionTargetId(value, data.conditionB);
      },
        /* t */ 'conditionB.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* u */ 'conditionC.conditionName': (value: string) => {
        return getConditionName(value);
      },
        /* v */ 'conditionC.left': (value: string, data: FieldsConfig) => {
        return extractConditionLeft(value, data.waterfallId, data.conditionC.conditionName);
      },
        /* w */ 'conditionC.operator': (value: string, data: FieldsConfig) => {
        return extractConditionOperator(value, data.conditionC);
      },
        /* x */ 'conditionC.target.in': (value: string) => {
        return extractConditionTargetIn(value);
      },
        /* y */ 'conditionC.target.id': (value: string, data: FieldsConfig) => {
        return extractConditionTargetId(value, data.conditionC);
      },
        /* z */ 'conditionC.target.percent': (value: string) => {
        return Number(value) / 100 || 1;
      },
        /* aa */ 'right.contractId': async (value: string, data: FieldsConfig) => {
        if (!value.trim()) return;
        if (value.split(separator).length > 1) throw mandatoryError(value, 'Contract Id', 'Multiple contract are not allowed');
        // If contract ID is specified instead of a date, we use signature date as right date.
        const contract = await getWaterfallDocument(value.trim(), waterfallDocumentsService, documentCache, data.waterfallId);
        if (!contract) throw optionalWarning('Contract Id');
        if (!isContract(contract)) throw mandatoryError(value, 'Contract Id', `Document "${contract.id}" is not a contract`);
        if (!contract.meta.duration.from) throw mandatoryError(value, 'Contract start date', `Contract id "${contract.id}" is missing start date.`);
        if (!contract.meta.duration.to) throw mandatoryError(value, 'Contract end date', `Contract id "${contract.id}" is missing end date.`);
        return contract.id;
      },
    };
  }

  function extractConditionLeft(value: string, waterfallId: string, conditionName: ConditionName) {
    if (!value) return '';
    switch (conditionName) {
      case 'orgRevenu':
      case 'orgTurnover': {
        return getRightholderId(value.trim(), waterfallId, waterfallService, rightholderCache);
      }
      default:
        return valueToId(value);
    }
  }

  function extractConditionOperator(value: string, cond: ImportedCondition) {
    if (['terms', 'contract'].includes(cond.conditionName)) {
      value = getArrayOperator(value);
      if (value && !arrayOperator.includes(value as ArrayOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${arrayOperator.map(o => `"${o}"`).join(' ')}`);
      return value as ArrayOperator;
    } else if (cond.conditionName === 'interest') {
      if (value) throw optionalWarning('Operator should be left empty for "interest" conditions');
      return;
    } else if (cond.conditionName === 'event') {
      value = getNumberOperator(value);
      if (value && (numberOperator.includes(value as NumberOperator) || arrayOperator.includes(value as ArrayOperator))) {
        return numberOperator.includes(value as NumberOperator) ? value as NumberOperator : value as ArrayOperator;
      } else {
        throw mandatoryError(value, 'Operator', `Allowed values are : ${[...numberOperator, ...arrayOperator].map(o => `"${o}"`).join(' ')}`);
      }
    } else {
      value = getNumberOperator(value);
      if (value && !numberOperator.includes(value as NumberOperator)) throw mandatoryError(value, 'Operator', `Allowed values are : ${numberOperator.map(o => `"${o}"`).join(' ')}`);
      return value as NumberOperator;
    }
  }

  function getNumberOperator(value: string): NumberOperator {
    if (value === '≥') return '>=';
    if (value.toLowerCase().trim() === 'greater than or equal to') return '>=';
    if (value.toLowerCase().trim() === 'less than') return '<';
    return value as NumberOperator;
  }

  function getArrayOperator(value: string): ArrayOperator {
    if (value.toLowerCase().trim() === 'not in (list)') return 'not-in';
    if (value.toLowerCase().trim() === 'in (list)') return 'in';
    return value as ArrayOperator;
  }

  function extractConditionTargetIn(value: string): TargetIn {
    const helperWords = ['date', 'number', 'amount', 'territories', 'medias', 'contract', 'film cost', 'list'];
    if (!helperWords.includes(value.trim().toLowerCase())) {

      /**
       * Mapping
       * @see https://docs.google.com/spreadsheets/d/19cKIMr-988727kfRnWor5FNAjBDgg2ZSRwbjj4s5iM0/edit#gid=1880420768
       */
      if (!targetIn.includes(value as TargetIn)) {
        if (!value.trim()) return;

        switch (value.trim().toLowerCase()) {
          case 'expenses':
            return 'expense';
          default:
            throw mandatoryError(value, 'Invalid Target Type');
        }
      }

      return value as TargetIn;
    }
  }

  function extractConditionTargetId(value: string, cond: ImportedCondition) {
    if (targetIn.includes(cond.target.in as TargetIn)) {
      if (!value) throw mandatoryError(value, 'Right Operand subject', `Right Operand subject must be specified for "${cond.target.in}"`);
      return valueToId(value);
    }

    if (cond.conditionName === 'terms') {
      const groups = Object.keys(staticGroups) as GroupScope[];
      const leftOperand = cond.left as any;
      if (!groups.includes(leftOperand)) throw mandatoryError(value, 'Operator', `For "terms" condition, expected value for left operand are : ${groups.map(g => `"${g}"`).join(' ')}`);
      cond.target.in = getGroupedList(value, leftOperand, separator);
      return;
    }

    if (cond.conditionName === 'contract') {
      cond.target.in = value.split(separator).map(v => v.trim()).filter(v => !!v);
      return;
    }

    if (value && !targetIn.includes(cond.target.in as TargetIn)) {
      cond.target.in = isNumber(value) ? Number(value) : value;
      return;
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

  function getRightType(value: string): RightType {
    switch (value.trim().toLowerCase()) {
      case 'commission':
        return 'commission';
      case 'expenses':
      case 'expenses recoupment':
        return 'expenses';
      case 'mg':
      case 'mg recoupment':
        return 'mg';
      case 'horizontal':
      case 'horizontal group':
        return 'horizontal';
      case 'vertical':
      case 'vertical group':
        return 'vertical';
      default:
        return 'unknown';
    }
  }

  function getConditionName(value: string): ConditionName {
    /**
     * Mapping
     * @see https://docs.google.com/spreadsheets/d/19cKIMr-988727kfRnWor5FNAjBDgg2ZSRwbjj4s5iM0/edit#gid=1880420768
     */
    if (!conditionNames.includes(value)) {
      if (!value.trim()) return;

      switch (value.trim().toLowerCase()) {
        case 'revenue share':
          return 'rightRevenu';
        case 'total right holder revenue':
          return 'orgRevenu';
        case 'total right holder calculated revenue':
          return 'poolShadowRevenu';
        case 'poolrevenue':
          return 'poolRevenu';
        case 'source total revenue':
        case 'producer\'s net participation':
        case 'distributor\'s gross receipts':
        case 'end of contract':
        case 'revenue territory':
        case 'revenue media':
        case 'quantity sold':
        default:
          throw mandatoryError(value, 'Invalid Evaluated Value Type (condition name)');
      }
    }

    return value as ConditionName;
  }

  return getAdminConfig();
}