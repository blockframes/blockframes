
import {
  ArrayOperator,
  Condition,
  Media,
  NumberOperator,
  Right,
  TargetValue,
  Territory,
  Waterfall,
  WaterfallContract,
  smartJoin,
  toLabel
} from '@blockframes/model';
import { rightholderName } from '../../../../pipes/rightholder-name.pipe';

function targetToString(target: TargetValue, waterfall?: Waterfall, contracts?: WaterfallContract[]) {
  if (typeof target === 'number') return `${target}€`;

  const { percent, id, in: targetIn } = target;
  /** @dev if more targets are enabled in "targetIn" libs/model/src/lib/waterfall/conditions.ts, add them here */
  switch (targetIn) {
    case 'expense': {
      const expenseTypes = Object.values(waterfall?.expenseTypes || {}).flat();
      const expenseType = expenseTypes.find(e => e.id === id);
      return `${percent * 100}% of ${expenseType?.name || id}'s expenses`;

    }
    case 'contracts.investment': {
      const contract = contracts?.find(c => c.id === id);
      return `${percent * 100}% of contract ${contract?.name || id}'s investments`;
    }
    default:
      return `${percent * 100}% of ${targetIn} ${id}`;
  }

}

function operatorToString(operator: NumberOperator | ArrayOperator) {
  switch (operator) {
    case '>=':
      return 'greater than or equal to';
    case '<':
      return 'lower than';
    case '==':
      return 'equal to';
    case '!=':
      return 'different from';
    case 'in':
      return 'in';
    case 'not-in':
      return 'not in';
    default:
      return '';
  }
}

export function conditionToString(condition?: Condition, waterfall?: Waterfall, contracts?: WaterfallContract[], rights?: Right[]) {
  if (!condition) return 'Unknown condition';

  if (condition.name === 'event') {
    const { eventId, operator, value } = condition.payload;
    let displayValue = '';
    if (Array.isArray(value)) {
      if (value.length > 3) displayValue = `${smartJoin([value[0], value[1], value[2]])} and ${value.length - 3} more`;
      else displayValue = smartJoin(value, ', ', ' and ');
    } else displayValue = `${value}`;
    return `Event ${eventId} is ${operatorToString(operator)} ${displayValue}`;
  }

  if (condition.name === 'incomeDate') {
    const { from, to } = condition.payload;
    if (from && to) return `Income date is between ${from} and ${to}`;
    if (from) return `Income date is after ${from}`;
    if (to) return `Income date is before ${to}`;
  }

  if (condition.name === 'contractDate') {
    const { from, to } = condition.payload;
    if (from && to) return `Contract date is between ${from} and ${to}`;
    if (from) return `Contract date is after ${from}`;
    if (to) return `Contract date is before ${to}`;
  }

  if (condition.name === 'amount') {
    /** @dev not implemented in libs/waterfall/src/lib/components/forms/conditions-form/condition.form.ts  */
    const { operator, target } = condition.payload;
    return `Amount is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'terms') {
    const { list: _list, operator, type } = condition.payload;
    const list = _list.map((t: Media | Territory) => toLabel(t, 'territories') || toLabel(t, 'medias'));
    let displayList = '';
    if (list.length > 3) displayList = `${smartJoin([list[0], list[1], list[2]])} and ${list.length - 3} more`;
    else displayList = smartJoin(list, ', ', ' and ');
    return `Sales ${type} are ${operatorToString(operator)} ${displayList}`;
  }

  if (condition.name === 'termsLength') {
    /** @dev not implemented in libs/waterfall/src/lib/components/forms/conditions-form/condition.form.ts  */
    const { operator, target } = condition.payload;
    return `Terms length is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'contract') {
    /** @dev not implemented in libs/waterfall/src/lib/components/forms/conditions-form/condition.form.ts  */
    const { contractIds, operator } = condition.payload;
    const contractNames = contractIds.map(id => contracts?.find(c => c.id === id)?.name || id);
    let displayList = '';
    if (contractNames.length > 3) displayList = `${smartJoin([contractNames[0], contractNames[1], contractNames[2]])} and ${contractNames.length - 3} more`;
    else displayList = smartJoin(contractNames, ', ', ' and ');
    return `Contract ${displayList} is ${operatorToString(operator)}`;
  }

  if (condition.name === 'contractAmount') {
    const { operator, target } = condition.payload;
    return `Contract amount is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'orgRevenu') {
    const { operator, orgId, target } = condition.payload;
    return `Org ${rightholderName(orgId, waterfall)}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'orgTurnover') {
    const { operator, orgId, target } = condition.payload;
    return `Org ${rightholderName(orgId, waterfall)}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'rightRevenu') {
    const { operator, rightId, target } = condition.payload;
    const right = rights?.find(r => r.id === rightId);
    return `Right ${right?.name || rightId}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'rightTurnover') {
    const { operator, rightId, target } = condition.payload;
    const right = rights?.find(r => r.id === rightId);
    return `Right ${right?.name || rightId}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'groupRevenu') {
    const { operator, groupId, target } = condition.payload;
    const group = rights?.find(r => r.id === groupId);
    return `Group ${group?.name || groupId}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'groupTurnover') {
    const { operator, groupId, target } = condition.payload;
    const group = rights?.find(r => r.id === groupId);
    return `Group ${group?.name || groupId}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'poolRevenu') {
    const { operator, target, pool } = condition.payload;
    return `Pool ${pool}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'poolTurnover') {
    const { operator, target, pool } = condition.payload;
    return `Pool ${pool}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'poolShadowRevenu') {
    const { operator, target, pool } = condition.payload;
    return `Pool ${pool}'s theoretical revenue is ${operatorToString(operator)} ${targetToString(target, waterfall)}`;
  }

  if (condition.name === 'interest') {
    const { isComposite, operator, orgId, rate, percent, contractId } = condition.payload;
    const contract = contracts?.find(c => c.id === contractId);
    const contractName = contract?.name || contractId;
    return `Org ${rightholderName(orgId, waterfall)}'s revenue is ${operatorToString(operator)} ${percent * 100}% of contract ${contractName}'s investments and ${isComposite ? 'composite' : ''} interest with a rate of ${rate * 100}%`;
  }

  return 'Unknown condition';
}