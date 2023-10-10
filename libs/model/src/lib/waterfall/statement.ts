import { DocumentMeta } from '../meta';
import { MovieCurrency, PaymentStatus, PaymentType, RightholderRole, StatementStatus } from '../static';
import { Duration, createDuration } from '../terms';

export interface Payment {
  id: string;
  type: PaymentType;
  price: number;
  currency: MovieCurrency;
  date: Date;
  status: PaymentStatus;
  to: string;
  incomeIds: string[]; // Incomes related to this payment
}

export interface IncomePayment extends Payment {
  type: 'income';
  incomeId: string; // Income related to this payment
  status: 'processed';
  to: undefined;
  incomeIds: undefined;
}

/**
 * "To Rightholder" payment to the licensor (money that the current righholder did not take for his rights)
 * Once processed, will take money available in Org.revenu.actual and assign it to licensor's Org, incrementing org actual revenu and turnover
 */
export interface RightholderPayment extends Payment {
  type: 'rightholder';
  to: string; // rightholderId referenced as licensor in the contract
}

/**
 * "To Right" payment (com, expense, MG etc)
 * Once processed, will assign money available in Org.revenu.actual to correct rights, incrementing right actual revenu and turnover
 * If Org that is sending money to right is not the same as the one that is receiving money from rightholder,
 * org.revenu.actual will be decremented for org sending money and org.revenu.actual and org.turnover.actual incremented for org receiving money
 */
export interface RightPayment extends Payment {
  type: 'right';
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
    to: '',
    incomeIds: params.incomeIds || [],
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
    to: undefined,
    incomeIds: undefined,
  }
}

export function createRightholderPayment(params: Partial<RightholderPayment> = {}): RightholderPayment {
  const payment = createPaymentBase(params);
  return {
    ...payment,
    type: 'rightholder',
  }
}

export function createRightPayment(params: Partial<RightPayment> = {}): RightPayment {
  const payment = createPaymentBase(params);
  return {
    ...payment,
    type: 'right',
  }
}

export interface Statement {
  _meta?: DocumentMeta;
  type: RightholderRole;
  status: StatementStatus;
  id: string;
  waterfallId: string;
  rightholderId: string;
  duration: Duration;
  contractId: string; // rightholderId is licensee or licensor of this contract (producer will always be licensor except for author's contracts)
  incomeIds: string[];
  payments: {
    internal: RightPayment[],
    external: Payment[]
  };
}

export interface DistributorStatement extends Statement {
  type: 'mainDistributor' | 'localDistributor' | 'salesAgent';
  expenseIds: string[]; // TODO #9493 producter statement should have expenseIds too if producer is making direct sells or does he make a distributor statement instead ?
  payments: {
    income: IncomePayment[],
    internal: RightPayment[],
    external: RightholderPayment[]
  };
  additional: {
    quantitySold?: number;
    salesContractIds?: {
      incomeId: string;
      contractId: string;
    }[];
  }
}

interface ParentPayment {
  statementId: string;
  paymentId: string;
}

export interface ProducerStatement extends Statement {
  type: 'producer' | 'coProducer';
  parentPayments: ParentPayment[];
  payments: {
    internal: RightPayment[],
    external: RightPayment[]
  };
}

function createStatementBase(params: Partial<Statement> = {}): Statement {
  return {
    id: '',
    type: 'producer',
    status: 'draft',
    waterfallId: '',
    rightholderId: '',
    contractId: '',
    incomeIds: params.incomeIds || [],
    payments: {
      internal: params.payments?.internal ? params.payments.internal.map(createRightPayment) : [],
      external: params.payments?.internal ? params.payments.external.map(createPaymentBase) : [],
    },
    ...params,
    duration: createDuration(params?.duration),
  };
}

export function createStatement(params: Partial<Statement>) {
  if (isDistributorStatement(params)) return createDistributorStatement(params);
  if (isProducerStatement(params)) return createProducerStatement(params);
}

export function isDistributorStatement(statement: Partial<Statement>): statement is DistributorStatement {
  return statement.type === 'mainDistributor' || statement.type === 'localDistributor' || statement.type === 'salesAgent';
}

export function isProducerStatement(statement: Partial<Statement>): statement is ProducerStatement {
  return statement.type === 'producer' || statement.type === 'coProducer';
}

function createDistributorStatement(params: Partial<DistributorStatement> = {}): DistributorStatement {
  const statement = createStatementBase(params);
  return {
    ...statement,
    payments: {
      income: params.payments?.income ? params.payments.income.map(createIncomePayment) : [],
      internal: statement.payments.internal,
      external: params.payments?.external ? params.payments.external.map(createRightholderPayment) : [],
    },
    type: params.type || 'mainDistributor',
    expenseIds: params.expenseIds || [],
    additional: {},
  }
}

export function createProducerStatement(params: Partial<ProducerStatement> = {}): ProducerStatement {
  const statement = createStatementBase(params);
  return {
    ...statement,
    parentPayments: params.parentPayments || [],
    payments: {
      internal: statement.payments.internal,
      external: params.payments?.external ? params.payments.external.map(createRightPayment) : [],
    },
    type: params.type || 'producer',
  }
}

