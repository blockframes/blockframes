
import { Condition, TargetValue } from '@blockframes/model';


function targetToString(target: TargetValue) {
  if (typeof target === 'number') {
    return `${target}€`;
  }
  const { percent, id, in: t } = target;
  const splitted = t.split('.');
  const moneyType = splitted.length > 1 ? splitted[1] : splitted[0];
  const targetType = splitted.length > 1 ? `${splitted[0] }` : '';
  return `${percent}% of ${targetType}${id}'s ${moneyType}`;
}

function operatorToString(operator: string) {
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


export function conditionToString(condition?: Condition) {

  if (!condition) return 'Unknown condition';

  if (condition.name === 'event') {
    const { eventId, operator, value } = condition.payload;
    let displayValue = '';
    if (Array.isArray(value)) {
      if (value.length >= 3) displayValue = `${value[0]}, ${value[1]}, ${value[2]} and ${value.length - 3} more`;
      else displayValue = value.join(', ');
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
    const { operator, target } = condition.payload;
    return `Amount is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'terms') {
    const { list, operator, type } = condition.payload;
    let displayList = '';
    if (list.length >= 3) displayList = `${list[0]}, ${list[1]}, ${list[2]} and ${list.length - 3} more`;
    else displayList = list.join(', ');
    return `Terms ${type} is ${operatorToString(operator)} ${displayList}`;
  }

  if (condition.name === 'termsLength') {
    const { operator, target } = condition.payload;
    return `Terms length is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'contract') {
    const { contractIds, operator } = condition.payload;
    let displayList = '';
    if (contractIds.length >= 3) displayList = `${contractIds[0]}, ${contractIds[1]}, ${contractIds[2]} and ${contractIds.length - 3} more`;
    else displayList = contractIds.join(', ');
    return `Contract ${displayList} is ${operatorToString(operator)}`;
  }

  if (condition.name === 'contractAmount') {
    const { operator, target } = condition.payload;
    return `Contract amount is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'orgRevenu') {
    const { operator, orgId, target } = condition.payload;
    return `Org ${orgId}'s revenue is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'orgTurnover') {
    const { operator, orgId, target } = condition.payload;
    return `Org ${orgId}'s turnover is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'rightRevenu') {
    const { operator, rightId, target } = condition.payload;
    return `Right ${rightId}'s revenue is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'rightTurnover') {
    const { operator, rightId, target } = condition.payload;
    return `Right ${rightId}'s turnover is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'groupRevenu') {
    const { operator, groupId, target } = condition.payload;
    return `Group ${groupId}'s revenue is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'groupTurnover') {
    const { operator, groupId, target } = condition.payload;
    return `Group ${groupId}'s turnover is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'poolRevenu') {
    const { operator, target, pool } = condition.payload;
    return `Pool ${pool}'s revenue is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'poolTurnover') {
    const { operator, target, pool } = condition.payload;
    return `Pool ${pool}'s turnover is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  if (condition.name === 'poolShadowRevenu') {
    const { operator, target, pool } = condition.payload;
    return `Pool ${pool}'s theoretical revenue is ${operatorToString(operator)} ${targetToString(target)}`;
  }

  // TODO
  // if (condition.name === 'interest') {
  //   const { isComposite, orgId, rate } = condition.payload;
  // }

  return 'Unknown condition';
}