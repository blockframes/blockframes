import { FormControl, FormGroup } from '@angular/forms';

import {
  Media,
  Condition,
  Territory,
  ArrayOperator,
  PoolCondition,
  ConditionTerms,
  GroupCondition,
  EventCondition,
  RightCondition,
  NumberOperator,
  numberOperator,
  ConditionDuration,
  OrgRevenuCondition,
  ConditionContractAmount,
  TargetValue,
  TargetIn,
} from '@blockframes/model';
import { FormList } from '@blockframes/utils/form';

export function createConditionForm() {
  return new FormGroup({
    conditionType: new FormControl(''), // Revenue Earned, Sales Specificity, Event


    // Condition Type: Revenue Earned
    revenueOwnerType: new FormControl(''), // Right Holder, Revenue Share, Group, Pool
    revenueOwner: new FormControl(''),
    revenueType: new FormControl(''), // Turnover, Profit, Theoretical Profit
    revenueOperator: new FormControl(''), // Numerical Operator (<, >, =, <=, >=)
    revenueTargetType: new FormControl<TargetIn | '' | 'amount'>(''), // Specific Amount, Investment, Expense
    // Target Type: Investment or Expense
    revenueTarget: new FormControl(''), // Investment = every documents of type 'contract' with a price != 0, Expense = something inside this right's contract: see with @phpgeek
    // Target Type: Investment
    revenuePercentage: new FormControl(0), // * Numeric value
    // Target Type: Expense
    revenueCap: new FormControl(''), // Cap, Uncap
    // Target Type: Specific Amount, Expense
    revenueAmount: new FormControl(0), // * Numeric value
    // --------------------


    // Condition Type: Sales Specificity
    salesType: new FormControl(''), // Payment Date, Contract Date, Contract Amount, Terms
    // Sales Type: Payment Date, Contract Date
    salesDateOperator: new FormControl(''), // Date Operator (before, after, between)
    // Sales Date Operator: After, Between
    salesDateFrom: new FormControl(new Date()), // * Date
    // Sales Date Operator: Before, Between
    salesDateTo: new FormControl(new Date()), // * Date
    // Sales Type: Contract Amount
    salesOperator: new FormControl(''), // Numerical Operator (<, >, =, <=, >=)
    salesAmount: new FormControl(0), // * Numeric value
    // Sales Type: Terms
    salesTermsType: new FormControl(''), // Media, Territory
    salesTermsOperator: new FormControl(''), // Inclusion Operator
    salesTerms: new FormControl<Media[] | Territory[]>([]), // *
    // --------------------


    // Condition Type: Event
    eventName: new FormControl(''), // Event
    eventOperator: new FormControl(''), // Numerical Operator (<, >, =, <=, >=) or Inclusion Operator
    // Operator: is numerical
    eventAmount: new FormControl(0), // * Numeric value
    // Operator: is inclusion
    eventList: FormList.factory([]), // *
    // --------------------

    // Condition Type: Interest // TODO
    // interestTargetOrg = new FormControl(''); // Org (right holder)
    // interestRate = new FormControl(0); // Numeric value
    // interestComposite = new FormControl(false); // Boolean
    // --------------------

    // --------------------
  });
}

export type ConditionForm = ReturnType<typeof createConditionForm>;

export function setConditionForm(form: ConditionForm, condition?: Partial<Condition>) {

  if (condition?.name === 'event') {
    form.controls.conditionType.setValue('event');
    form.controls.eventName.setValue(condition?.payload.eventId ?? '');
    form.controls.eventOperator.setValue(condition?.payload.operator ?? '');
    if (numberOperator.includes(condition?.payload.operator as any)) {
      form.controls.eventAmount.setValue(condition?.payload.value as number ?? 0);
    } else {
      form.controls.eventList.setValue(condition?.payload.value as string[] ?? []);
    }
  }

  if (condition?.name === 'incomeDate') {
    form.controls.conditionType.setValue('sales');
    form.controls.salesType.setValue('incomeDate');
    if (condition?.payload.from && condition?.payload.to) {
      form.controls.salesDateOperator.setValue('between');
      form.controls.salesDateFrom.setValue(condition?.payload.from);
      form.controls.salesDateTo.setValue(condition?.payload.to);
    } else if (condition?.payload.from) {
      form.controls.salesDateOperator.setValue('after');
      form.controls.salesDateFrom.setValue(condition?.payload.from);
    } else if (condition?.payload.to) {
      form.controls.salesDateOperator.setValue('before');
      form.controls.salesDateTo.setValue(condition?.payload.to);
    }
  }

  if (condition?.name === 'contractDate') {
    form.controls.conditionType.setValue('sales');
    form.controls.salesType.setValue('contractDate');
    if (condition?.payload.from && condition?.payload.to) {
      form.controls.salesDateOperator.setValue('between');
      form.controls.salesDateFrom.setValue(condition?.payload.from);
      form.controls.salesDateTo.setValue(condition?.payload.to);
    } else if (condition?.payload.from) {
      form.controls.salesDateOperator.setValue('after');
      form.controls.salesDateFrom.setValue(condition?.payload.from);
    } else if (condition?.payload.to) {
      form.controls.salesDateOperator.setValue('before');
      form.controls.salesDateTo.setValue(condition?.payload.to);
    }
  }

  if (condition?.name === 'amount') {
    // TODO there is no way to create that type of condition ???
  }

  if (condition?.name === 'terms') {
    form.controls.conditionType.setValue('sales');
    form.controls.salesType.setValue('terms');
    form.controls.salesTermsType.setValue(condition.payload.type);
    form.controls.salesTermsOperator.setValue(condition.payload.operator);
    form.controls.salesTerms.setValue(condition.payload.list);
  }

  if (condition?.name === 'termsLength') {
    // TODO there is no way to create that type of condition ???
  }

  if (condition?.name === 'contract') {
    // TODO there is no way to create that type of condition ???
  }

  if (condition?.name === 'contractAmount') {
    form.controls.conditionType.setValue('sales');
    form.controls.salesType.setValue('contractAmount');
    form.controls.salesOperator.setValue(condition?.payload.operator ?? '');
    form.controls.salesAmount.setValue(condition?.payload.target as number ?? 0);
  }

  if (condition?.name === 'orgRevenu') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('org');
    form.controls.revenueOwner.setValue(condition?.payload.orgId ?? '');
    form.controls.revenueType.setValue('Revenu');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'orgTurnover') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('org');
    form.controls.revenueOwner.setValue(condition?.payload.orgId ?? '');
    form.controls.revenueType.setValue('Turnover');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'poolRevenu') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('pool');
    form.controls.revenueOwner.setValue(condition?.payload.pool ?? '');
    form.controls.revenueType.setValue('Revenu');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'poolShadowRevenu') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('pool');
    form.controls.revenueOwner.setValue(condition?.payload.pool ?? '');
    form.controls.revenueType.setValue('ShadowRevenu');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'poolTurnover') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('pool');
    form.controls.revenueOwner.setValue(condition?.payload.pool ?? '');
    form.controls.revenueType.setValue('Turnover');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'rightRevenu') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('right');
    form.controls.revenueOwner.setValue(condition?.payload.rightId ?? '');
    form.controls.revenueType.setValue('Revenu');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'rightTurnover') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('right');
    form.controls.revenueOwner.setValue(condition?.payload.rightId ?? '');
    form.controls.revenueType.setValue('Turnover');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'groupRevenu') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('group');
    form.controls.revenueOwner.setValue(condition?.payload.groupId ?? '');
    form.controls.revenueType.setValue('Revenu');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  if (condition?.name === 'groupTurnover') {
    form.controls.conditionType.setValue('revenue');
    form.controls.revenueOwnerType.setValue('group');
    form.controls.revenueOwner.setValue(condition?.payload.groupId ?? '');
    form.controls.revenueType.setValue('Turnover');
    form.controls.revenueOperator.setValue(condition?.payload.operator ?? '');

    setConditionTarget(form, condition?.payload.target);
  }

  // if (condition?.name === 'interest') {} // TODO
}

function setConditionTarget(form: ConditionForm, target?: TargetValue) {
  if (!target) return;
  if (typeof target === 'number') {
    form.controls.revenueTargetType.setValue('amount');
    form.controls.revenueAmount.setValue(target as number ?? 0);
  } else {
    form.controls.revenueTarget.setValue(target.id);
    form.controls.revenuePercentage.setValue(target.percent * 100);
    form.controls.revenueTargetType.setValue(target.in);
  }
}

export function formToCondition(form: ConditionForm): Condition | undefined {
  if (form.controls.conditionType.value === 'event') return formToEventCondition(form);
  if (form.controls.conditionType.value === 'sales') return formToIncomeCondition(form);
  if (form.controls.conditionType.value === 'revenue') return formToRevenueCondition(form);
}

/**
 * Conditions about events
 * @param form 
 * @returns 
 */
function formToEventCondition(form: ConditionForm): Condition | undefined {
  if (!form.controls.eventOperator.value) return undefined;
  const operator = form.controls.eventOperator.value as NumberOperator | ArrayOperator;
  if (operator === 'in' || operator === 'not-in') {
    if (!form.controls.eventList.value.length) return undefined;
  } else {
    if (!form.controls.eventAmount.value) return undefined;
  }

  const name = 'event';
  const payload: EventCondition = {
    eventId: form.controls.eventName.value,
    operator: form.controls.eventOperator.value as NumberOperator | ArrayOperator,
    value: form.controls.eventAmount.value ?? form.controls.eventList.value
  };
  return { name, payload };
}

/**
 * Conditions about incomes
 * @param form 
 * @returns 
 */
function formToIncomeCondition(form: ConditionForm): Condition | undefined {
  if (!form.controls.salesType.value) return undefined;
  else if (form.controls.salesType.value === 'incomeDate' || form.controls.salesType.value === 'contractDate') {
    if (!form.controls.salesDateOperator.value) return undefined;
    const operator = form.controls.salesDateOperator.value as 'before' | 'after' | 'between';
    if (operator === 'between') {
      if (!form.controls.salesDateFrom.value || !form.controls.salesDateTo.value) return undefined;
    } else if (operator === 'after') {
      if (!form.controls.salesDateFrom.value) return undefined;
    } else if (operator === 'before') {
      if (!form.controls.salesDateTo.value) return undefined;
    }
    const name = form.controls.salesType.value;
    const payload: ConditionDuration = {
      from: form.controls.salesDateFrom.value,
      to: form.controls.salesDateTo.value
    };
    return { name, payload };
  } else if (form.controls.salesType.value === 'contractAmount') {
    if (!form.controls.salesAmount.value) return undefined;
    const name = 'contractAmount';
    const payload: ConditionContractAmount = {
      operator: form.controls.salesOperator.value as NumberOperator,
      target: form.controls.salesAmount.value
    };
    return { name, payload };
  } else if (form.controls.salesType.value === 'terms') {
    if (!form.controls.salesTerms) return undefined;
    const name = 'terms';
    const payload: ConditionTerms = {
      operator: form.controls.salesTermsOperator.value as ArrayOperator,
      type: form.controls.salesTermsType.value as 'medias' | 'territories',
      list: form.controls.salesTerms.value
    };
    return { name, payload };
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

  const orgId = form.controls.revenueOwner.value;
  const rightId = form.controls.revenueOwner.value;
  const groupId = form.controls.revenueOwner.value;
  const pool = form.controls.revenueOwner.value;
  const operator = form.controls.revenueOperator.value as NumberOperator;
  const specificAmount = form.controls.revenueAmount.value;

  if (form.controls.revenueOwnerType.value === 'org' && form.controls.revenueType.value === 'Revenu') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: OrgRevenuCondition = {
        orgId,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'orgRevenu', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: OrgRevenuCondition = {
        orgId,
        operator,
        target: specificAmount
      };
      return { name: 'orgRevenu', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'org' && form.controls.revenueType.value === 'Turnover') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: OrgRevenuCondition = {
        orgId,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'orgTurnover', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: OrgRevenuCondition = {
        orgId,
        operator,
        target: specificAmount
      };
      return { name: 'orgTurnover', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'right' && form.controls.revenueType.value === 'Revenu') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: RightCondition = {
        rightId,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'rightRevenu', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: RightCondition = {
        rightId,
        operator,
        target: specificAmount
      };
      return { name: 'rightRevenu', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'right' && form.controls.revenueType.value === 'Turnover') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: RightCondition = {
        rightId,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'rightTurnover', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: RightCondition = {
        rightId,
        operator,
        target: specificAmount
      };
      return { name: 'rightTurnover', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'group' && form.controls.revenueType.value === 'Revenu') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: GroupCondition = {
        groupId,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'groupRevenu', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: GroupCondition = {
        groupId,
        operator,
        target: specificAmount
      };
      return { name: 'groupRevenu', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'group' && form.controls.revenueType.value === 'Turnover') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: GroupCondition = {
        groupId,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'groupTurnover', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: GroupCondition = {
        groupId,
        operator,
        target: specificAmount
      };
      return { name: 'groupTurnover', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'pool' && form.controls.revenueType.value === 'Revenu') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: PoolCondition = {
        pool,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'poolRevenu', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: PoolCondition = {
        pool,
        operator,
        target: specificAmount
      };
      return { name: 'poolRevenu', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'pool' && form.controls.revenueType.value === 'ShadowRevenu') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: PoolCondition = {
        pool,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'poolShadowRevenu', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: PoolCondition = {
        pool,
        operator,
        target: specificAmount
      };
      return { name: 'poolShadowRevenu', payload };
    }
  } else if (form.controls.revenueOwnerType.value === 'pool' && form.controls.revenueType.value === 'Turnover') {
    if (targetIn === 'investment') {
      if (!form.controls.revenuePercentage.value) return undefined;
      const payload: PoolCondition = {
        pool,
        operator,
        target: formToTarget(form, targetIn)
      };
      return { name: 'poolTurnover', payload };
    } else {
      if (!specificAmount) return undefined;
      const payload: PoolCondition = {
        pool,
        operator,
        target: specificAmount
      };
      return { name: 'poolTurnover', payload };
    }
  }
}

function formToTarget(form: ConditionForm, targetIn: TargetIn): TargetValue {
  return {
    in: targetIn,
    id: form.controls.revenueTarget.value,
    percent: form.controls.revenuePercentage.value / 100
  }
}

