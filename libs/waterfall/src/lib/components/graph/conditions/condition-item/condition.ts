
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
import { format } from 'date-fns';
import { getUserDefaultDateFormat } from '@blockframes/utils/date-adapter';
import { toCurrency } from '@blockframes/utils/currency-format';

const toFixedPercentage = (percent: number) => (percent * 100).toLocaleString(undefined, { maximumFractionDigits: 4, minimumFractionDigits: 0 });

function targetToString(target: TargetValue, waterfall: Waterfall, contracts: WaterfallContract[]) {
  if (typeof target === 'number') return toCurrency(target, waterfall.mainCurrency);

  const { percent, id, in: targetIn } = target;
  /** @dev if more targets are enabled in "targetIn" libs/model/src/lib/waterfall/conditions.ts, add them here */
  switch (targetIn) {
    case 'expense': {
      const expenseTypes = Object.values(waterfall?.expenseTypes || {}).flat();
      const expenseType = expenseTypes.find(e => e.id === id);
      return $localize`${expenseType?.name || id}'s expenses`; // For expense target, percent is always 100

    }
    case 'contracts.investment': {
      const contract = contracts?.find(c => c.id === id);
      return $localize`${toFixedPercentage(percent)}% of contract ${contract?.name || id}'s investments`;
    }
    case 'amortization.filmCost': {
      return $localize`${toFixedPercentage(percent)}%`;
    }
    default:
      return $localize`${toFixedPercentage(percent)}% of ${targetIn} ${id}`;
  }

}

function operatorToString(operator: NumberOperator | ArrayOperator) {
  switch (operator) {
    case '>=':
      return $localize`greater than or equal to`;
    case '<':
      return $localize`lower than`;
    case '==':
      return $localize`equal to`;
    case '!=':
      return $localize`different from`;
    case 'in':
      return $localize`in`;
    case 'not-in':
      return $localize`not in`;
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
      else displayValue = smartJoin(value, ', ', $localize` and `);
    } else displayValue = `${value}`;
    return `Event ${eventId} is ${operatorToString(operator)} ${displayValue}`;
  }

  if (condition.name === 'incomeDate') {
    const defaultFormat = getUserDefaultDateFormat();
    const { from, to } = condition.payload;
    if (from && to) return $localize`Income date is between ${format(from, defaultFormat)} and ${format(to, defaultFormat)}`;
    if (from) return $localize`Income date is after ${format(from, defaultFormat)}`;
    if (to) return $localize`Income date is before ${format(to, defaultFormat)}`;
  }

  if (condition.name === 'contractDate') {
    const defaultFormat = getUserDefaultDateFormat();
    const { from, to } = condition.payload;
    if (from && to) return $localize`Contract date is between ${format(from, defaultFormat)} and ${format(to, defaultFormat)}`;
    if (from) return $localize`Contract date is after ${format(from, defaultFormat)}`;
    if (to) return $localize`Contract date is before ${format(to, defaultFormat)}`;
  }

  if (condition.name === 'amount') {
    /** @dev not implemented in libs/waterfall/src/lib/components/forms/conditions-form/condition.form.ts  */
    const { operator, target } = condition.payload;
    return $localize`Amount is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'terms') {
    const { list: _list, operator, type } = condition.payload;
    const list = _list.map((t: Media | Territory) => toLabel(t, 'territories') || toLabel(t, 'medias'));
    let displayList = '';
    if (list.length > 3) displayList = `${smartJoin([list[0], list[1], list[2]])} and ${list.length - 3} more`;
    else displayList = smartJoin(list, ', ', $localize` and `);
    return $localize`Sales ${type} are ${operatorToString(operator)} ${displayList}`;
  }

  if (condition.name === 'termsLength') {
    /** @dev not implemented in libs/waterfall/src/lib/components/forms/conditions-form/condition.form.ts  */
    const { operator, target } = condition.payload;
    return $localize`Terms length is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'contract') {
    /** @dev not implemented in libs/waterfall/src/lib/components/forms/conditions-form/condition.form.ts  */
    const { contractIds, operator } = condition.payload;
    const contractNames = contractIds.map(id => contracts?.find(c => c.id === id)?.name || id);
    let displayList = '';
    if (contractNames.length > 3) displayList = `${smartJoin([contractNames[0], contractNames[1], contractNames[2]])} and ${contractNames.length - 3} more`;
    else displayList = smartJoin(contractNames, ', ', $localize` and `);
    return $localize`Contract ${displayList} is ${operatorToString(operator)}`;
  }

  if (condition.name === 'contractAmount') {
    const { operator, target } = condition.payload;
    return $localize`Contract amount is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'orgRevenu') {
    const { operator, orgId, target } = condition.payload;
    return $localize`Org ${rightholderName(orgId, waterfall)}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'orgTurnover') {
    const { operator, orgId, target } = condition.payload;
    return $localize`Org ${rightholderName(orgId, waterfall)}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'rightRevenu') {
    const { operator, rightId, target } = condition.payload;
    const right = rights?.find(r => r.id === rightId);
    return $localize`Right ${right?.name || rightId}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'rightTurnover') {
    const { operator, rightId, target } = condition.payload;
    const right = rights?.find(r => r.id === rightId);
    return $localize`Right ${right?.name || rightId}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'groupRevenu') {
    const { operator, groupId, target } = condition.payload;
    const group = rights?.find(r => r.id === groupId);
    return $localize`Group ${group?.name || groupId}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'groupTurnover') {
    const { operator, groupId, target } = condition.payload;
    const group = rights?.find(r => r.id === groupId);
    return $localize`Group ${group?.name || groupId}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'poolRevenu') {
    const { operator, target, pool } = condition.payload;
    return $localize`Pool ${pool}'s revenue is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'poolTurnover') {
    const { operator, target, pool } = condition.payload;
    return $localize`Pool ${pool}'s turnover is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'poolShadowRevenu') {
    const { operator, target, pool } = condition.payload;
    return $localize`Pool ${pool}'s theoretical revenue is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  if (condition.name === 'interest') {
    const { isComposite, operator, orgId, rate, percent, contractId } = condition.payload;
    const contract = contracts?.find(c => c.id === contractId);
    const contractName = contract?.name || contractId;
    return $localize`Org ${rightholderName(orgId, waterfall)}'s revenue is ${operatorToString(operator)} ${toFixedPercentage(percent)}% of contract ${contractName}'s investments and ${isComposite ? 'composite' : ''} interest with a rate of ${toFixedPercentage(rate)}%`;
  }

  if (condition.name === 'filmAmortized') {
    const { target, operator } = condition.payload;
    if (typeof target === 'number') return $localize`Invalid condition`;
    if (operator === '>=' && target.percent === 1) return $localize`Film is amortized`;
    if (operator === '<' && target.percent === 1) return $localize`Film is not amortized`;
    return $localize`Film amortization is ${operatorToString(operator)} ${targetToString(target, waterfall, contracts)}`;
  }

  return 'Unknown condition';
}