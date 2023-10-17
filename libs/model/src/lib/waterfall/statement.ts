import { DocumentMeta } from '../meta';
import { MovieCurrency, PaymentStatus, PaymentType, StatementType, StatementStatus } from '../static';
import { Duration, createDuration } from '../terms';
import { sortByDate } from '../utils';
import { History } from './state';

export interface Payment {
  id: string;
  type: PaymentType;
  price: number;
  currency: MovieCurrency;
  date: Date;
  status: PaymentStatus;
  mode: 'internal' | 'external';
}

/**
 * "To Income" payment to the rightholder's org of the statement, will increment org actual revenu and turnover
 */
export interface IncomePayment extends Payment {
  type: 'income';
  incomeId: string; // Income related to this payment
  status: 'processed';
}

/**
 * "To Rightholder" payment to the org of the opposite rightholder of the statement (licensor or licensee)
 * Once processed, will take money available in Org.revenu.actual and assign it to the other Org, incrementing org actual revenu and turnover
 */
export interface RightholderPayment extends Payment {
  type: 'rightholder';
  mode: 'external';
  incomeIds: string[]; // Incomes related to this payment
  to: string; // rightholderId : the other party of the contract that is not the rightholder of the statement
}

/**
 * "To Right" payment (com, expense, MG etc)
 * Once processed, will assign money available in Org.revenu.actual to correct rights, incrementing right actual revenu and turnover
 */
export interface RightPayment extends Payment {
  type: 'right';
  mode: 'internal' | 'external';
  incomeIds: string[]; // Incomes related to this payment
  to: string; // rightId
}

function createPaymentBase(params: Partial<Payment> = {}): Payment {
  return {
    id: '',
    type: 'rightholder',
    price: 0,
    currency: 'EUR',
    date: new Date(),
    status: 'pending',
    mode: 'internal',
    ...params,
  };
}

export function createIncomePayment(params: Partial<IncomePayment> = {}): IncomePayment {
  const payment = createPaymentBase(params);
  return {
    incomeId: '',
    ...payment,
    type: 'income',
    status: 'processed',
  }
}

export function createRightholderPayment(params: Partial<RightholderPayment> = {}): RightholderPayment {
  const payment = createPaymentBase(params);
  return {
    to: '',
    ...payment,
    incomeIds: params.incomeIds || [],
    mode: 'external',
    type: 'rightholder',
  }
}

export function createRightPayment(params: Partial<RightPayment> = {}): RightPayment {
  const payment = createPaymentBase(params);
  return {
    to: '',
    ...payment,
    incomeIds: params.incomeIds || [],
    type: 'right',
    mode: params.mode
  }
}

export interface Statement {
  _meta?: DocumentMeta;
  type: StatementType;
  status: StatementStatus;
  id: string;
  waterfallId: string;
  rightholderId: string;
  duration: Duration;
  incomeIds: string[];
  payments: {
    right: RightPayment[]
  };
}

export interface DistributorStatement extends Statement {
  type: 'mainDistributor' | 'localDistributor' | 'salesAgent';
  contractId: string; // rightholderId is licensee or licensor of this contract
  expenseIds: string[];
  payments: {
    income: IncomePayment[];
    right: RightPayment[]; // Mode internal & external
    rightholder: RightholderPayment;
  };
  additional: {
    quantitySold?: number;
    salesContractIds?: {
      incomeId: string;
      contractId: string;
    }[];
  }
}

export interface ProducerStatement extends Statement {
  type: 'producer' | 'coProducer';
  contractId: string; // rightholderId is licensee or licensor of this contract
  payments: {
    right: RightPayment[]; // Mode external
    rightholder: RightholderPayment;
  };
}

export interface DirectSalesStatement extends Statement {
  type: 'directSales';
  expenseIds: string[];
  payments: {
    income: IncomePayment[];
    right: RightPayment[]; // Mode internal
  };
}

function createStatementBase(params: Partial<Statement> = {}): Statement {
  return {
    id: '',
    type: 'producer',
    status: 'draft',
    waterfallId: '',
    rightholderId: '',
    incomeIds: params.incomeIds || [],
    payments: {
      right: params.payments?.right ? params.payments.right.map(createRightPayment) : []
    },
    ...params,
    duration: createDuration(params?.duration),
  };
}

export function createStatement(params: Partial<Statement>) {
  if (isDistributorStatement(params)) return createDistributorStatement(params);
  if (isProducerStatement(params)) return createProducerStatement(params);
  if (isDirectSalesStatement(params)) return createDirectSalesStatement(params);
}

export function isDistributorStatement(statement: Partial<Statement>): statement is DistributorStatement {
  return statement.type === 'mainDistributor' || statement.type === 'localDistributor' || statement.type === 'salesAgent';
}

export function isProducerStatement(statement: Partial<Statement>): statement is ProducerStatement {
  return statement.type === 'producer' || statement.type === 'coProducer';
}

export function isDirectSalesStatement(statement: Partial<Statement>): statement is DirectSalesStatement {
  return statement.type === 'directSales';
}

function createDistributorStatement(params: Partial<DistributorStatement> = {}): DistributorStatement {
  const statement = createStatementBase(params);
  return {
    contractId: '',
    ...statement,
    payments: {
      income: params.payments?.income ? params.payments.income.map(createIncomePayment) : [],
      right: statement.payments.right,
      rightholder: params.payments?.rightholder || undefined
    },
    type: params.type || 'mainDistributor',
    expenseIds: params.expenseIds || [],
    additional: {},
  }
}

export function createProducerStatement(params: Partial<ProducerStatement> = {}): ProducerStatement {
  const statement = createStatementBase(params);
  return {
    contractId: '',
    ...statement,
    payments: {
      right: statement.payments.right,
      rightholder: params.payments?.rightholder || undefined
    },
    type: params.type || 'producer',
  }
}

export function createDirectSalesStatement(params: Partial<DirectSalesStatement> = {}): DirectSalesStatement {
  const statement = createStatementBase(params);
  return {
    ...statement,
    payments: {
      income: params.payments?.income ? params.payments.income.map(createIncomePayment) : [],
      right: statement.payments.right
    },
    type: 'directSales',
    expenseIds: params.expenseIds || [],
  }
}

/**
 * 
 * @returns the state history for the statements generated by this rightholder for this contract
 */
export function getStatementsHistory(history: History[], statements: Statement[], rightholderId: string, contractId?: string) {

  const filteredStatements = statements
    .filter(s => s.rightholderId === rightholderId)
    .filter(s => !contractId || ((isDistributorStatement(s) || isProducerStatement(s)) && s.contractId === contractId));

  const sortedStatements = sortByDate(filteredStatements, 'duration.to');
  const uniqueDates = Array.from(new Set(sortedStatements.map(s => s.duration.to.getTime())));

  return uniqueDates
    .map(date => history.find(h => new Date(h.date).getTime() === date))
    .filter(h => !!h);
}