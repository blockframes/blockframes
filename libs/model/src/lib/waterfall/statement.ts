import { DocumentMeta } from '../meta';
import { MovieCurrency, PaymentStatus, PaymentType, StatementType, StatementStatus, rightholderGroups } from '../static';
import { Duration, createDuration } from '../terms';
import { sortByDate } from '../utils';
import { History, TitleState } from './state';
import { WaterfallContract, WaterfallSource, getAssociatedSource, getIncomesSources } from './waterfall';
import { Right } from './right';
import { pathExists } from './node';
import { Income } from '../income';
import { getContractWith } from '../contract';

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
  status: 'received';
}

/**
 * "To Rightholder" payment to the org of the opposite rightholder of the statement (licensor or licensee)
 * Once received, will take money available in Org.revenu.actual and assign it to the other Org, incrementing org actual revenu and turnover
 */
export interface RightholderPayment extends Payment {
  type: 'rightholder';
  mode: 'external';
  incomeIds: string[]; // Incomes related to this payment
}

/**
 * "To Right" payment (com, expense, MG etc)
 * Once received, will assign money available in Org.revenu.actual to correct rights, incrementing right actual revenu and turnover
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
    status: 'received',
  }
}

export function createRightholderPayment(params: Partial<RightholderPayment> = {}): RightholderPayment {
  const payment = createPaymentBase(params);
  return {
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
  senderId: string, // rightholderId of statement creater
  receiverId: string, // rightholderId of statement receiver
  duration: Duration;
  incomeIds: string[];
  payments: {
    right: RightPayment[]
  };
}

export interface DistributorStatement extends Statement {
  type: 'mainDistributor' | 'salesAgent';
  contractId: string; // For distributor statements, rightholderId is licensee (and producer is licensor) of this contract
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
  type: 'producer';
  contractId: string; // For outgoing statements, rightholderId (producer) is licensor of this contract, except for statements made to author (in this case, producer is licensee)
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
    senderId: '',
    receiverId: '',
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
  return Object.keys(rightholderGroups.distributors).includes(statement.type);
}

export function isProducerStatement(statement: Partial<Statement>): statement is ProducerStatement {
  return statement.type === 'producer';
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
    type: 'producer',
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
export function getStatementsHistory(history: History[], statements: Statement[], senderId: string, contractId?: string) {

  const filteredStatements = statements
    .filter(s => s.senderId === senderId)
    .filter(s => !contractId || ((isDistributorStatement(s) || isProducerStatement(s)) && s.contractId === contractId));

  const sortedStatements = sortByDate(filteredStatements, 'duration.to');
  const uniqueDates = Array.from(new Set(sortedStatements.map(s => s.duration.to.getTime())));

  return uniqueDates
    .map(date => history.find(h => new Date(h.date).getTime() === date))
    .filter(h => !!h);
}

/**
 * Fetch all distributor and direct sales statements where the rightholder has received payments
 * @param receiverId 
 * @param statements 
 * @param date 
 */
function getIncomingStatements(receiverId: string, statements: Statement[], incomes: Income[], sources: WaterfallSource[], date: Date) {
  // Fetch active distributor statements where rightholder has received payments
  const distributorStatements = statements
    .filter(s => isDistributorStatement(s) && s.payments.rightholder)
    .filter(s => s.duration.to.getTime() <= date.getTime())
    .filter((s: DistributorStatement) => s.receiverId === receiverId && s.payments.rightholder.status === 'received') as DistributorStatement[];

  // Fetch active direct sales statements created by the rightholder
  const directSalesStatements = statements
    .filter(s => isDirectSalesStatement(s))
    .filter(s => s.duration.to.getTime() <= date.getTime())
    .filter(s => s.senderId === receiverId && s.status === 'reported') as DirectSalesStatement[];

  // Fetch incomes and sources related to this statements
  const distributorStatementsIncomeIds = distributorStatements.map(s => s.payments.rightholder.incomeIds).flat();
  const directSalesStatementsIncomeIds = directSalesStatements.map(s => s.incomeIds).flat();
  const incomeIds = Array.from(new Set([...distributorStatementsIncomeIds, ...directSalesStatementsIncomeIds]));
  const statementIncomes = incomes.filter(i => incomeIds.includes(i.id));
  const incomeSources = getIncomesSources(statementIncomes, sources);
  return { distributorStatements, directSalesStatements, incomeIds, sources: incomeSources };
}

interface OutgoingStatementPrerequistsConfig {
  senderId: string,
  receiverId: string,
  statements: Statement[],
  contracts: WaterfallContract[],
  rights: Right[],
  titleState: TitleState,
  incomes: Income[],
  sources: WaterfallSource[],
  date: Date
}

export function getOutgoingStatementPrerequists({ senderId, receiverId, statements, contracts, rights, titleState, incomes, sources, date }: OutgoingStatementPrerequistsConfig) {
  const incomingStatements = getIncomingStatements(senderId, statements, incomes, sources, date);
  // No incoming distributor or direct sales statements for senderId, no need to create outgoing statement
  if (!incomingStatements.distributorStatements.length && !incomingStatements.directSalesStatements.length) return {};

  const contract = getContractWith([senderId, receiverId], contracts, date);
  // There is no contract between senderId and receiverId, cannot create outgoing statement
  if (!contract) return {};

  const contractRights = rights.filter(r => r.contractId === contract.id);
  // Contract have no rights associated, cannot create outgoing statement
  if (!contractRights) return {};

  // If there is no path between the rights of the contract and the sources of the incoming statements, cannot create outgoing statement
  const hasPath = contractRights.some(r => incomingStatements.sources.some(s => pathExists(r.id, s.id, titleState)));
  if (!hasPath) return {};

  // Fetch previous statements for this contract (this senderId and receiverId)
  const previousStatements = statements.filter(s => !isDirectSalesStatement(s))
    .filter((s: ProducerStatement | DistributorStatement) => s.contractId === contract.id);

  // Fetch incomeIds for which no statement was created for this contract, if there is no incomeIds, cannot create outgoing statement
  const incomeIds = incomingStatements.incomeIds.filter(id => !previousStatements.some(s => s.incomeIds.includes(id)));
  if (!incomeIds.length) return {};

  // Filter incomes again to keep only incomes that are related to this contract
  const statementIncomeIds = incomeIds.filter(id => {
    // Filter incomes again to keep only incomes that are related to this contract
    const income = incomes.find(i => i.id === id);
    const source = getAssociatedSource(income, sources);
    return contractRights.some(r => pathExists(r.id, source.id, titleState));
  })

  return { incomeIds: statementIncomeIds, contract };
}

export function canCreateOutgoingStatement(data: OutgoingStatementPrerequistsConfig) {
  return !!getOutgoingStatementPrerequists(data).incomeIds?.length;
}