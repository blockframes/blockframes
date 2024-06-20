
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  Expense,
  ExpenseType,
  Income,
  IncomePayment,
  RightPayment,
  RightholderPayment,
  Statement,
  WaterfallSource
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
    date: new FormControl<Date>(income?.date ?? new Date()),
    status: new FormControl<string>(income?.status ?? 'pending'),
    sourceId: new FormControl<string>(income?.sourceId ?? ''),
    titleId: new FormControl<string>(income?.titleId ?? ''),
  };
}

type IncomeFormControl = ReturnType<typeof createIncomeFormControl>;

export class IncomeForm extends FormEntity<IncomeFormControl> {
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
    date: new FormControl<Date>(expense?.date ?? new Date()),
    status: new FormControl<string>(expense?.status ?? 'pending'),
    titleId: new FormControl<string>(expense?.titleId ?? ''),
    rightholderId: new FormControl<string>(expense?.rightholderId ?? ''),
    typeId: new FormControl<string>(expense?.typeId ?? ''),
    nature: new FormControl<string>(expense?.nature ?? ''),
    capped: new FormControl<boolean>(expense?.capped ?? false),
  };
}

type ExpenseFormControl = ReturnType<typeof createExpenseFormControl>;

export class ExpenseForm extends FormEntity<ExpenseFormControl> {
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
  expenseTypes: ExpenseType[],
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
    incomePayments: FormList.factory(statement?.payments.income, (el) => new IncomePaymentForm(el)),
    rightPayments: FormList.factory(statement?.payments.right, (el) => new RightPaymentForm(el)),
    rightholderPayment: new RightholderPaymentForm(statement?.payments.rightholder),
    comment: new FormControl<string>(statement?.comment ?? '')
  }

  for (const source of statement?.sources ?? []) {
    const incomes = statement?.incomes.filter(i => i.sourceId === source.id);
    controls[`incomes-${source.id}`] = FormList.factory(incomes, (el) => new IncomeForm(el));
  }

  for (const expenseType of statement?.expenseTypes ?? []) {
    const expenses = statement?.expenses.filter(e => e.typeId === expenseType.id) || [];
    controls[`expenses-${expenseType.id}`] = FormList.factory(expenses, (el) => new ExpenseForm(el));
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

  getSource(sourceId: string) {
    return this.get(`incomes-${sourceId}` as any);
  }

  getIncomes(sourceId: string) {
    return this.value[`incomes-${sourceId}`] as Income[];
  }

  addIncomes(incomes: Income[]) {
    for (const income of incomes) {
      this.addIncome(income);
    }
  }

  addIncome(income: Income) {
    if (!this.controls[income.sourceId]) {
      this.addControl(`incomes-${income.sourceId}`, FormList.factory([income], (el) => new IncomeForm(el)));
    }
  }

  removeSource(sourceId: string) {
    this.removeControl(`incomes-${sourceId}`);
  }

  getExpenseType(expenseTypeId: string) {
    return this.get(`expenses-${expenseTypeId}` as any);
  }

  getExpenses(expenseTypeId: string) {
    return this.value[`expenses-${expenseTypeId}`] as Expense[];
  }

}