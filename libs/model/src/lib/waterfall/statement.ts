import { DocumentMeta } from '../meta';
import { MovieCurrency, RightholderRole } from '../static';
import { Duration, createDuration } from '../terms';

interface IncomeStatement {
  rights: Record<number, string>; // Ordered rights to apply for a specific income
  incomeId: string;
}

export interface Payment {
  id: string;
  type: 'external' | 'internal'; // TODO #9493 create type ?
  price: number;
  currency: MovieCurrency;
  date: Date;
  status: 'pending' | 'processed'; // TODO #9493 create type  (same as Income interface)
  to: string;
}

/**
 * "External" payment to the licensor (money that the current righholder did not take for his rights)
 * Once processed, will take money available in Org.revenu.actual and assign it to licensor's Org, incrementing org actual revenu and turnover
 */
interface ExternalPayment extends Payment {
  type: 'external';
  to: string; // rightholderId referenced as licensor in the contract
}

/**
 * "Internal" payment (com, expense, MG etc)
 * Once processed, will assign money available in Org.revenu.actual to correct rights, incrementing right actual revenu and turnover
 */
interface InternalPayment extends Payment {
  type: 'internal'
  to: string; // rightId
}

export interface Statement {
  _meta?: DocumentMeta;
  type: RightholderRole;
  id: string;
  waterfallId: string;
  rightholderId: string;
  duration: Duration;
  contractId: string; // rightholderId is licensee or licensor of this contract
  payments: {
    external?: ExternalPayment,
    internal: InternalPayment[]
  };
  additional: {
    quantitySold?: number;
    salesContractId?: string;
  }
}

export interface DistributorStatement extends Statement {
  type: 'mainDistributor'
  incomes: IncomeStatement[];
  expenseIds: string[];
}

export interface ProducerStatement extends Statement {
  type: 'producer'
}

export interface FinancierStatement extends Statement {
  type: 'financier'
}

function createStatementBase(params: Partial<Statement> = {}): Statement {
  return {
    id: '',
    type: 'producer',
    waterfallId: '',
    rightholderId: '',
    contractId: '',
    payments: {
      internal: []
    },
    additional: {},
    ...params,
    duration: createDuration(params?.duration),
  };
}

export function createStatement(params: Partial<Statement>) {
  if (isDistributorStatement(params)) return createDistributorStatement(params);
  if (isProducerStatement(params)) return createProducerStatement(params);
  if (isFinancierStatement(params)) return createFinancierStatement(params);
}

export function isDistributorStatement(statement: Partial<Statement>): statement is DistributorStatement {
  return statement.type === 'mainDistributor';
}

export function isProducerStatement(statement: Partial<Statement>): statement is ProducerStatement {
  return statement.type === 'producer';
}

export function isFinancierStatement(statement: Partial<Statement>): statement is FinancierStatement {
  return statement.type === 'financier';
}

export function createDistributorStatement(params: Partial<DistributorStatement> = {}): DistributorStatement {
  const statement = createStatementBase(params);
  return {
    ...statement,
    type: 'mainDistributor',
    incomes: params.incomes || [],
    expenseIds: params.expenseIds || [],
  }
}

export function createProducerStatement(params: Partial<ProducerStatement> = {}): ProducerStatement {
  const statement = createStatementBase(params);
  return {
    ...statement,
    type: 'producer',
  }
}

export function createFinancierStatement(params: Partial<FinancierStatement> = {}): FinancierStatement {
  const statement = createStatementBase(params);
  return {
    ...statement,
    type: 'financier',
  }
}
