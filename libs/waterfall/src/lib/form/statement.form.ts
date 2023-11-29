
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Expense,
  Income,
  IncomePayment,
  RightPayment,
  RightholderPayment,
  Statement,
  WaterfallSource,
  getAssociatedSource
} from '@blockframes/model';
import { FormEntity, FormList, compareDates, isDateAfter } from '@blockframes/utils/form';

// ------------------------------
//         INCOMES
// ------------------------------

function createIncomeFormControl(income?: Partial<Income>) {
  return {
    id: new FormControl<string>(income?.id ?? ''),
    contractId: new FormControl<string>(income?.contractId ?? ''),
    medias: new FormControl<string[]>(income?.medias ?? []),
    territories: new FormControl<string[]>(income?.territories ?? []),
    price: new FormControl<number>(income?.price ?? 0),
    currency: new FormControl<string>(income?.currency ?? 'EUR'),
    date: new FormControl<Date>(income?.date ?? new Date()),
    status: new FormControl<string>(income?.status ?? 'pending'),
    sourceId: new FormControl<string>(income?.sourceId ?? ''),
    titleId: new FormControl<string>(income?.titleId ?? ''),
  };
}

type IncomeFormControl = ReturnType<typeof createIncomeFormControl>;

class IncomeForm extends FormEntity<IncomeFormControl> {
  constructor(income?: Partial<Income>) {
    super(createIncomeFormControl(income));
  }
}

// ------------------------------
//         EXPENSES
// ------------------------------

function createExpenseFormControl(expense?: Partial<Expense>) {
  return {
    id: new FormControl<string>(expense?.id ?? ''),
    contractId: new FormControl<string>(expense?.contractId ?? ''),
    price: new FormControl<number>(expense?.price ?? 0),
    currency: new FormControl<string>(expense?.currency ?? 'EUR'),
    date: new FormControl<Date>(expense?.date ?? new Date()),
    status: new FormControl<string>(expense?.status ?? 'pending'),
    titleId: new FormControl<string>(expense?.titleId ?? ''),
    rightholderId: new FormControl<string>(expense?.rightholderId ?? ''),
    type: new FormControl<string>(expense?.type ?? ''),
    category: new FormControl<string>(expense?.category ?? ''),
  };
}

type ExpenseFormControl = ReturnType<typeof createExpenseFormControl>;

class ExpenseForm extends FormEntity<ExpenseFormControl> {
  constructor(expense?: Partial<Expense>) {
    super(createExpenseFormControl(expense));
  }
}

// ------------------------------
//         PAYMENTS
// ------------------------------

function createIncomePaymentControl(income?: Partial<IncomePayment>) {
  return {
    id: new FormControl<string>(income?.id ?? ''),
    type: new FormControl<string>('income'),
    price: new FormControl<number>(income?.price ?? 0),
    currency: new FormControl<string>(income?.currency ?? 'EUR'),
    date: new FormControl<Date>(income?.date),
    status: new FormControl<string>('received'),
    mode: new FormControl<string>('internal'),
    incomeId: new FormControl<string>(income?.incomeId ?? ''),
  };
}

type IncomePaymentControl = ReturnType<typeof createIncomePaymentControl>;

class IncomePaymentForm extends FormEntity<IncomePaymentControl> {
  constructor(income?: Partial<IncomePayment>) {
    super(createIncomePaymentControl(income));
  }
}

function createRightPaymentControl(right?: Partial<RightPayment>) {
  return {
    id: new FormControl<string>(right?.id ?? ''),
    type: new FormControl<string>('right'),
    price: new FormControl<number>(right?.price ?? 0),
    currency: new FormControl<string>(right?.currency ?? 'EUR'),
    date: new FormControl<Date>(right?.date),
    status: new FormControl<string>(right?.status ?? 'pending'),
    mode: new FormControl<string>(right?.mode ?? 'internal'),
    incomeIds: new FormControl<string[]>(right?.incomeIds ?? []),
    to: new FormControl<string>(right?.to ?? ''),
  };
}

type RightPaymentControl = ReturnType<typeof createRightPaymentControl>;

class RightPaymentForm extends FormEntity<RightPaymentControl> {
  constructor(right?: Partial<RightPayment>) {
    super(createRightPaymentControl(right));
  }
}

function createRightholderPaymentControl(rightholder?: Partial<RightholderPayment>) {
  return {
    id: new FormControl<string>(rightholder?.id ?? ''),
    type: new FormControl<string>('rightholder'),
    price: new FormControl<number>(rightholder?.price ?? 0),
    currency: new FormControl<string>(rightholder?.currency ?? 'EUR'),
    date: new FormControl<Date>(rightholder?.date),
    status: new FormControl<string>(rightholder?.status ?? 'pending'),
    mode: new FormControl<string>('external'),
    incomeIds: new FormControl<string[]>(rightholder?.incomeIds ?? []),
  };
}

type RightholderPaymentControl = ReturnType<typeof createRightholderPaymentControl>;

class RightholderPaymentForm extends FormEntity<RightholderPaymentControl> {
  constructor(rightholder?: Partial<RightholderPayment>) {
    super(createRightholderPaymentControl(rightholder));
  }
}

// ------------------------------
//         STATEMENT
// ------------------------------

interface FullStatement extends Statement {
  sources: WaterfallSource[]
  incomes: Income[],
  expenses: Expense[]
}

function createStatementFormControl(statement?: Partial<FullStatement>) {

  const stateInitDate = new Date(1); // 01/01/1970
  const fromValidators = [compareDates('from', 'to', 'from'), isDateAfter(stateInitDate), Validators.required];
  const toValidators = [compareDates('from', 'to', 'to'), isDateAfter(stateInitDate), Validators.required];

  const controls = {
    duration: new FormGroup({
      from: new FormControl<Date>(statement?.duration.from ?? new Date(), fromValidators),
      to: new FormControl<Date>(statement?.duration?.to ?? new Date(), toValidators),
    }),
    reported: new FormControl<Date>(statement?.reported ?? new Date()),
    expenses: FormList.factory(statement?.expenses, (el) => new ExpenseForm(el)),

    incomePayments: FormList.factory(statement?.payments.income, (el) => new IncomePaymentForm(el)),
    rightPayments: FormList.factory(statement?.payments.right, (el) => new RightPaymentForm(el)),
    rightholderPayment: new RightholderPaymentForm(statement?.payments.rightholder),
    comment: new FormControl<string>(statement?.comment ?? ''),
    incomeIds: new FormControl<string[]>(statement?.incomeIds ?? []),
  }

  for (const source of statement?.sources ?? []) {
    const incomes = statement?.incomes.filter(i => getAssociatedSource(i, statement.sources).id === source.id);
    controls[source.id] = FormList.factory(incomes, (el) => new IncomeForm(el));
  }

  return controls;
}

type StatementFormControl = ReturnType<typeof createStatementFormControl>;

export class StatementForm extends FormEntity<StatementFormControl> {
  constructor(statement?: Partial<FullStatement>) {
    super(createStatementFormControl(statement));
  }

  setAllValue(statement: Partial<FullStatement> = {}) {
    const controls = createStatementFormControl(statement);
    for (const key in controls) {
      if (this.contains(key)) {
        const control = this.get(key as keyof StatementFormControl);
        const value = controls[key].value;
        if (control instanceof FormList) {
          control.patchAllValue(value);
        } else {
          control.patchValue(value);
        }
      } else {
        this.addControl(key, controls[key]);
      }
    }
  }

}