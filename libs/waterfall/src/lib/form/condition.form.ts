
import { FormControl } from '@angular/forms';
import { FormEntity, FormList } from '@blockframes/utils/form';
import {
  ArrayOperator,
  Condition,
  ConditionContractAmount,
  ConditionDuration,
  ConditionInterest,
  ConditionName,
  ConditionOwnerLabel,
  ConditionTerms,
  EventCondition,
  FilmAmortizedCondition,
  GroupCondition,
  GroupScope,
  Media,
  NumberOperator,
  OrgRevenuCondition,
  PoolCondition,
  RightCondition,
  TargetIn,
  TargetValue,
  Territory,
  numberOperator
} from '@blockframes/model';

const toFixedPercentage = (percent: number) => Math.round((percent * 100) * 10000) / 10000;

function createConditionFormControl() {
  return {
    conditionType: new FormControl<'revenue' | 'sales' | 'event' | 'amortization' | ''>(''), // Revenue Earned, Sales Specificity, Event, Film Amortization

    // Condition Type: Revenue Earned
    revenueOwnerType: new FormControl<ConditionOwnerLabel | ''>(''), // Right Holder, Revenue Share, Group, Pool
    revenueOwner: new FormControl(''),
    revenueType: new FormControl<'Turnover' | 'Revenu' | 'ShadowRevenu' | ''>(''), // Turnover, Profit, Theoretical Profit
    revenueOperator: new FormControl<NumberOperator | ''>(''), // Numerical Operator (<, >, =, <=, >=)
    revenueTargetType: new FormControl<TargetIn | '' | 'amount'>(''), // Specific Amount, Investment, Expense
    // Target Type: Investment or Expense
    revenueTarget: new FormControl(''), // Investment = every documents of type 'contract' with a price != 0, Expense = something inside this right's contract: see with @phpgeek
    // Target Type: Investment
    revenuePercentage: new FormControl(0), // Numeric value
    // Target Type: Expense
    revenueCap: new FormControl<'cap' | 'uncap' | ''>(''), // Cap, Uncap
    // Target Type: Specific Amount, Expense
    revenueAmount: new FormControl(0), // Numeric value
    // --------------------

    // Condition Type: Sales Specificity
    salesType: new FormControl<ConditionName | ''>(''), // Payment Date, Contract Date, Contract Amount, Terms
    // Sales Type: Payment Date, Contract Date
    salesDateOperator: new FormControl<'before' | 'after' | 'between' | ''>(''), // Date Operator (before, after, between)
    // Sales Date Operator: After, Between
    salesDateFrom: new FormControl(new Date()), // Date
    // Sales Date Operator: Before, Between
    salesDateTo: new FormControl(new Date()), // Date
    // Sales Type: Contract Amount
    salesOperator: new FormControl<NumberOperator | ''>(''), // Numerical Operator (<, >, =, <=, >=)
    salesAmount: new FormControl(0), // Numeric value
    // Sales Type: Terms
    salesTermsType: new FormControl<GroupScope | ''>(''), // Media, Territory
    salesTermsOperator: new FormControl<ArrayOperator | ''>(''), // Inclusion Operator
    salesTerms: new FormControl<Media[] | Territory[]>([]),
    // --------------------

    // Condition Type: Event
    eventName: new FormControl(''), // Event
    eventOperator: new FormControl<NumberOperator | ArrayOperator | ''>(''), // Numerical Operator (<, >, =, <=, >=) or Inclusion Operator
    // Operator: is numerical
    eventAmount: new FormControl(0), // Numeric value
    // Operator: is inclusion
    eventList: FormList.factory([]),
    // --------------------

    // Condition Type: Interest
    interestRate: new FormControl(0), // Numeric value
    interestComposite: new FormControl(false), // Boolean
    // --------------------

    // Condition Type: Film Amortization
    amortizationTarget: new FormControl(''), // Amortization Id
    amortizationOperator: new FormControl<NumberOperator | ''>(''), // Numerical Operator (<, >, =, <=, >=)
    amortizationPercentage: new FormControl(100), // Numeric value
    // --------------------

  };
}

type ConditionFormControl = ReturnType<typeof createConditionFormControl>;

export class ConditionForm extends FormEntity<ConditionFormControl> {
  constructor() {
    const control = createConditionFormControl();
    super(control);
  }

  reset() {
    super.reset();
    this.controls.salesTerms = new FormControl<Media[] | Territory[]>([]);
    this.markAsPristine();
  }
}

export function setConditionForm(form: ConditionForm, condition?: Partial<Condition>) {
  if (!condition) return;

  switch (condition.name) {
    case 'event':
      form.controls.conditionType.setValue('event');
      form.controls.eventName.setValue(condition.payload.eventId ?? '');
      form.controls.eventOperator.setValue(condition.payload.operator ?? '');
      if (numberOperator.includes(condition.payload.operator as NumberOperator)) {
        form.controls.eventAmount.setValue(condition.payload.value as number ?? 0);
      } else {
        form.controls.eventList.setValue(condition.payload.value as string[] ?? []);
      }
      break;
    case 'incomeDate':
    case 'contractDate':
      form.controls.conditionType.setValue('sales');
      form.controls.salesType.setValue(condition.name);
      if (condition.payload.from && condition.payload.to) {
        form.controls.salesDateOperator.setValue('between');
        form.controls.salesDateFrom.setValue(condition.payload.from);
        form.controls.salesDateTo.setValue(condition.payload.to);
      } else if (condition.payload.from) {
        form.controls.salesDateOperator.setValue('after');
        form.controls.salesDateFrom.setValue(condition.payload.from);
      } else if (condition.payload.to) {
        form.controls.salesDateOperator.setValue('before');
        form.controls.salesDateTo.setValue(condition.payload.to);
      }
      break;
    case 'terms':
      form.controls.conditionType.setValue('sales');
      form.controls.salesType.setValue('terms');
      form.controls.salesTermsType.setValue(condition.payload.type);
      form.controls.salesTermsOperator.setValue(condition.payload.operator);
      form.controls.salesTerms.setValue(condition.payload.list);
      break;
    case 'contractAmount':
      form.controls.conditionType.setValue('sales');
      form.controls.salesType.setValue('contractAmount');
      form.controls.salesOperator.setValue(condition.payload.operator ?? '');
      form.controls.salesAmount.setValue(condition.payload.target as number ?? 0);
      break;
    case 'orgRevenu':
    case 'orgTurnover':
      form.controls.conditionType.setValue('revenue');
      form.controls.revenueOwnerType.setValue('org');
      form.controls.revenueOwner.setValue(condition.payload.orgId ?? '');
      form.controls.revenueType.setValue(condition.name.replace('org', '') as 'Turnover' | 'Revenu');
      form.controls.revenueOperator.setValue(condition.payload.operator ?? '');
      setConditionTarget(form, condition.payload.target);
      break;
    case 'poolRevenu':
    case 'poolShadowRevenu':
    case 'poolTurnover':
      form.controls.conditionType.setValue('revenue');
      form.controls.revenueOwnerType.setValue('pool');
      form.controls.revenueOwner.setValue(condition.payload.pool ?? '');
      form.controls.revenueType.setValue(condition.name.replace('pool', '') as 'Turnover' | 'Revenu' | 'ShadowRevenu');
      form.controls.revenueOperator.setValue(condition.payload.operator ?? '');
      setConditionTarget(form, condition.payload.target);
      break;
    case 'rightRevenu':
    case 'rightTurnover':
      form.controls.conditionType.setValue('revenue');
      form.controls.revenueOwnerType.setValue('right');
      form.controls.revenueOwner.setValue(condition.payload.rightId ?? '');
      form.controls.revenueType.setValue(condition.name.replace('right', '') as 'Turnover' | 'Revenu');
      form.controls.revenueOperator.setValue(condition.payload.operator ?? '');
      setConditionTarget(form, condition.payload.target);
      break;
    case 'groupRevenu':
    case 'groupTurnover':
      form.controls.conditionType.setValue('revenue');
      form.controls.revenueOwnerType.setValue('group');
      form.controls.revenueOwner.setValue(condition.payload.groupId ?? '');
      form.controls.revenueType.setValue(condition.name.replace('group', '') as 'Turnover' | 'Revenu');
      form.controls.revenueOperator.setValue(condition.payload.operator ?? '');
      setConditionTarget(form, condition.payload.target);
      break;
    case 'interest':
      form.controls.conditionType.setValue('revenue');
      form.controls.revenueOwnerType.setValue('org');
      form.controls.revenueOwner.setValue(condition.payload.orgId ?? '');
      form.controls.revenueType.setValue('Revenu');
      form.controls.revenueOperator.setValue(condition.payload.operator ?? '');
      form.controls.interestRate.setValue(toFixedPercentage(condition.payload.rate ?? 0));
      form.controls.interestComposite.setValue(condition.payload.isComposite ?? false);
      setConditionTarget(form, {
        id: condition.payload.contractId,
        percent: condition.payload.percent,
        in: 'contracts.investment'
      });
      break;
    case 'filmAmortized':
      form.controls.conditionType.setValue('amortization');
      form.controls.amortizationTarget.setValue(condition.payload.amortizationId ?? '');
      form.controls.amortizationOperator.setValue(condition.payload.operator ?? '');
      form.controls.amortizationPercentage.setValue(toFixedPercentage(condition.payload.percent ?? 100));
      break;
    case 'amount':
    case 'termsLength':
    case 'contract':
    default:
      // TODO check there is no way to create that type of condition ???
      break;
  }
}

function setConditionTarget(form: ConditionForm, target?: TargetValue) {
  if (!target) return;
  if (typeof target === 'number') {
    form.controls.revenueTargetType.setValue('amount');
    form.controls.revenueAmount.setValue(target as number ?? 0);
  } else {
    form.controls.revenueTarget.setValue(target.id);
    form.controls.revenuePercentage.setValue(toFixedPercentage(target.percent));
    form.controls.revenueTargetType.setValue(target.in);
  }
}

export function formToCondition(form: ConditionForm): Condition | undefined {
  const conditionType = form.controls.conditionType.value;
  if (conditionType === 'event') return formToEventCondition(form);
  if (conditionType === 'sales') return formToIncomeCondition(form);
  if (conditionType === 'revenue') return formToRevenueCondition(form);
  if (conditionType === 'amortization') return formToAmortizationCondition(form);
}

/**
 * Conditions about events
 * @param form 
 * @returns 
 */
function formToEventCondition(form: ConditionForm): Condition | undefined {
  const operator = form.controls.eventOperator.value;
  if (!operator) return undefined;

  if (operator === 'in' || operator === 'not-in') {
    if (!form.controls.eventList.value.length) return undefined;
  } else {
    if (!form.controls.eventAmount.value) return undefined;
  }

  const name = 'event';
  const payload: EventCondition = {
    eventId: form.controls.eventName.value,
    operator,
    value: form.controls.eventAmount.value ?? form.controls.eventList.value
  };
  return { name, payload };
}

/**
 * Conditions about film Amortization
 * @param form 
 * @returns 
 */
function formToAmortizationCondition(form: ConditionForm): Condition | undefined {
  const operator = form.controls.amortizationOperator.value;
  const percent = form.controls.amortizationPercentage.value;
  const amortizationId = form.controls.amortizationTarget.value;

  if (!operator) return undefined;
  if (!amortizationId) return undefined;
  if (!percent) return undefined;

  const name = 'filmAmortized';
  const payload: FilmAmortizedCondition = {
    amortizationId,
    operator,
    percent: percent / 100
  };
  return { name, payload };
}

/**
 * Conditions about incomes
 * @param form 
 * @returns 
 */
function formToIncomeCondition(form: ConditionForm): Condition | undefined {
  const conditionName = form.controls.salesType.value;
  if (!conditionName) return undefined;

  if (conditionName === 'incomeDate' || conditionName === 'contractDate') {
    const operator = form.controls.salesDateOperator.value;
    if (!operator) return undefined;

    const from = form.controls.salesDateFrom.value;
    const to = form.controls.salesDateTo.value;

    const payload: ConditionDuration = {};
    if (operator === 'between') {
      if (!from || !to) return undefined;
      payload.from = from;
      payload.to = to;
    } else if (operator === 'after') {
      if (!from) return undefined;
      payload.from = from;
    } else if (operator === 'before') {
      if (!to) return undefined;
      payload.to = to;
    }

    return { name: conditionName, payload };
  }

  if (conditionName === 'contractAmount') {
    const target = form.controls.salesAmount.value;
    if (!target) return undefined;

    const payload: ConditionContractAmount = {
      operator: form.controls.salesOperator.value as NumberOperator,
      target
    };
    return { name: conditionName, payload };
  }

  if (conditionName === 'terms') {
    if (!form.controls.salesTerms.value?.length) return undefined;

    const payload: ConditionTerms = {
      operator: form.controls.salesTermsOperator.value as ArrayOperator,
      type: form.controls.salesTermsType.value as GroupScope,
      list: form.controls.salesTerms.value
    };
    return { name: conditionName, payload };
  }
}

/**
 * Conditions about revenue/turnover of an org, right, group or pool
 * @param form 
 * @returns 
 */
function formToRevenueCondition(form: ConditionForm): Condition | undefined {
  const targetIn = form.controls.revenueTargetType.value;

  if (!targetIn) return undefined;

  const operator = form.controls.revenueOperator.value as NumberOperator;
  const specificAmount = form.controls.revenueAmount.value;
  const percent = form.controls.revenuePercentage.value;
  const revenueOwnerType = form.controls.revenueOwnerType.value;
  const revenueType = form.controls.revenueType.value;

  switch (revenueOwnerType) {
    case 'org': {
      if (!['Revenu', 'Turnover'].includes(revenueType)) return undefined;

      const interestRate = form.controls.interestRate.value;
      const orgId = form.controls.revenueOwner.value;

      if (targetIn === 'contracts.investment' && revenueType === 'Revenu' && interestRate > 0) {
        const payload: ConditionInterest = {
          orgId: form.controls.revenueOwner.value,
          contractId: form.controls.revenueTarget.value,
          percent: percent / 100,
          operator,
          rate: interestRate / 100,
          isComposite: form.controls.interestComposite.value
        }

        return { name: 'interest', payload };
      }

      const conditionName: ConditionName = `${revenueOwnerType}${revenueType}` as 'orgRevenu' | 'orgTurnover';

      let target: TargetValue | number;

      if (targetIn !== 'amount') {
        if (!percent) return undefined;
        target = formToTarget(form, targetIn);
      } else {
        if (!specificAmount) return undefined;
        target = specificAmount;
      }

      const payload: OrgRevenuCondition = { orgId, operator, target };

      return { name: conditionName, payload };
    }
    case 'right': {
      if (!['Revenu', 'Turnover'].includes(revenueType)) return undefined;

      const rightId = form.controls.revenueOwner.value;
      const conditionName: ConditionName = `${revenueOwnerType}${revenueType}` as 'rightRevenu' | 'rightTurnover';

      let target: TargetValue | number;

      if (targetIn !== 'amount') {
        if (!percent) return undefined;
        target = formToTarget(form, targetIn);
      } else {
        if (!specificAmount) return undefined;
        target = specificAmount;
      }

      const payload: RightCondition = { rightId, operator, target };

      return { name: conditionName, payload };
    }
    case 'group': {
      if (!['Revenu', 'Turnover'].includes(revenueType)) return undefined;

      const groupId = form.controls.revenueOwner.value;
      const conditionName: ConditionName = `${revenueOwnerType}${revenueType}` as 'groupRevenu' | 'groupTurnover';

      let target: TargetValue | number;

      if (targetIn !== 'amount') {
        if (!percent) return undefined;
        target = formToTarget(form, targetIn);
      } else {
        if (!specificAmount) return undefined;
        target = specificAmount;
      }

      const payload: GroupCondition = { groupId, operator, target };

      return { name: conditionName, payload };
    }
    case 'pool': {
      if (!['Revenu', 'Turnover', 'ShadowRevenu'].includes(revenueType)) return undefined;

      const pool = form.controls.revenueOwner.value;
      const conditionName: ConditionName = `${revenueOwnerType}${revenueType}` as 'poolRevenu' | 'poolTurnover' | 'poolShadowRevenu';

      let target: TargetValue | number;

      if (targetIn !== 'amount') {
        if (!percent) return undefined;
        target = formToTarget(form, targetIn);
      } else {
        if (!specificAmount) return undefined;
        target = specificAmount;
      }

      const payload: PoolCondition = { pool, operator, target };

      return { name: conditionName, payload };
    }
    default:
      break;
  }
}

function formToTarget(form: ConditionForm, targetIn: TargetIn): TargetValue {
  return {
    in: targetIn,
    id: form.controls.revenueTarget.value,
    percent: targetIn === 'expense' ? 1 : (form.controls.revenuePercentage.value / 100)
  }
}
