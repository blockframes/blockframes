import { DocumentMeta } from '../meta';
import { MovieCurrency, PaymentStatus, PaymentType, StatementType, StatementStatus, rightholderGroups, RightType } from '../static';
import { Duration, createDuration } from '../terms';
import { PricePerCurrency, getTotalPerCurrency, sortByDate, sum, toLabel } from '../utils';
import { TitleState, TransferState } from './state';
import { Version, Waterfall, WaterfallContract, WaterfallSource, getIncomesSources } from './waterfall';
import { Right, RightOverride, createRightOverride, getRightCondition } from './right';
import { getSources, isVerticalGroupChild, nodeExists, pathExists } from './node';
import { Income, createIncome } from '../income';
import { getContractsWith } from '../contract';
import { mainCurrency } from './action';
import { ConditionWithTarget, isConditionWithTarget } from './conditions';
import { Expense } from '../expense';
import { InterestDetail } from './interest';

export interface Payment {
  id: string;
  type: PaymentType;
  price: number;
  currency: MovieCurrency;
  date?: Date;
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
  mode: 'internal';
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
    mode: 'internal',
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
  contractId?: string;
  status: StatementStatus;
  id: string;
  waterfallId: string;
  senderId: string, // rightholderId of statement creator
  receiverId: string, // rightholderId of statement receiver
  duration: Duration;
  reported?: Date;
  incomeIds: string[];
  expenseIds?: string[];
  versionId: string; // Version used to create this statement
  duplicatedFrom: string; // Id of the statement this one was duplicated from
  standalone: boolean; // True if statement was generated using a standalone waterfall version
  payments: {
    income?: IncomePayment[];
    right: RightPayment[]
    rightholder?: RightholderPayment;
  };
  comment: string;
  rightOverrides: RightOverride[];
  reportedData: { // Final data of the statement once it is reported
    sourcesBreakdown?: SourcesBreakdown[];
    rightsBreakdown?: RightsBreakdown[];
    groupsBreakdown?: GroupsBreakdown[];
    details?: DetailsRow[];
    expenses?: (Expense & { cap?: PricePerCurrency })[];
    interests?: InterestDetail[];
  }
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
    versionId: '',
    duplicatedFrom: '',
    standalone: false,
    payments: {
      right: params.payments?.right ? params.payments.right.map(createRightPayment) : []
    },
    comment: params.comment || '',
    reportedData: {},
    ...params,
    duration: createDuration(params?.duration),
    rightOverrides: params.rightOverrides ? params.rightOverrides.map(createRightOverride) : []
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

export function createDistributorStatement(params: Partial<DistributorStatement> = {}): DistributorStatement {
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

export function filterStatements(type: StatementType, parties: string[], contractId = '', statements: Statement[]) {
  if (parties.length !== 2) return [];
  const isSender = (s: Statement) => s.senderId === parties[0] && s.receiverId === parties[1];
  const isReceiver = (s: Statement) => s.senderId === parties[1] && s.receiverId === parties[0];
  const filteredStatements = statements.filter(s => s.type === type && (isSender(s)) || isReceiver(s));
  if (type !== 'directSales') return filteredStatements.filter(s => s.contractId === contractId);
  return filteredStatements;
}

export function sortStatements(statements: Statement[], reverse = true): (Statement & { number: number })[] {
  const sortedStatements = sortByDate(statements, 'duration.to').map((s, i) => ({ ...s, number: i + 1 }));
  return reverse ? sortedStatements.reverse() : sortedStatements;
}

export function getStatementNumber(current: Statement, statements: Statement[]) {
  const history = sortStatements(statements);
  return history.find(s => s.id === current.id)?.number || 1;
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
    .filter((s: DistributorStatement) => s.receiverId === receiverId && s.payments.rightholder.status === 'received' && s.payments.rightholder.date?.getTime() <= date.getTime()) as DistributorStatement[];

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
  const prerequists: Record<string, { contract: WaterfallContract, incomeIds: string[] }> = {};
  const incomingStatements = getIncomingStatements(senderId, statements, incomes, sources, date);
  // No incoming distributor or direct sales statements for senderId, no need to create outgoing statement
  if (!incomingStatements.distributorStatements.length && !incomingStatements.directSalesStatements.length) return {};

  const matchingContracts = getContractsWith([senderId, receiverId], contracts, date);
  // There is no contract between senderId and receiverId, cannot create outgoing statement
  if (!matchingContracts.length) return prerequists;

  for (const contract of matchingContracts) {
    const contractRights = rights.filter(r => r.contractId === contract.id);
    // Contract have no rights associated, cannot create outgoing statement
    if (!contractRights) continue;

    // If there is no path between the rights of the contract and the sources of the incoming statements, cannot create outgoing statement
    const hasPath = contractRights.some(r => incomingStatements.sources.some(s => pathExists(r.id, s.id, titleState)));
    if (!hasPath) continue;

    // Fetch previous statements for this contract (this senderId and receiverId)
    const previousStatements = statements.filter(s => !isDirectSalesStatement(s))
      .filter((s: ProducerStatement | DistributorStatement) => s.contractId === contract.id);

    // Fetch incomeIds for which no statement was created for this contract, if there is no incomeIds, cannot create outgoing statement
    const incomeIds = incomingStatements.incomeIds.filter(id => !previousStatements.some(s => s.incomeIds.includes(id)));
    if (!incomeIds.length) continue;

    // Filter incomes again to keep only incomes that are related to this contract
    const statementIncomeIds = incomeIds.filter(id => {
      // Filter incomes again to keep only incomes that are related to this contract
      const income = incomes.find(i => i.id === id);
      return contractRights.some(r => pathExists(r.id, income.sourceId, titleState));
    });

    if (!statementIncomeIds.length) continue;

    prerequists[contract.id] = { contract, incomeIds: statementIncomeIds };
  }

  return prerequists;
}

/**
 * Return the rights that should be used during statement creation
 * Will include rights of senderId and/or receiverId depending of the statement type.
 * If statement have a contractId, it will also be used to filter rights.
 * @param statement 
 * @param _rights 
 * @returns 
 */
export function getStatementRights(statement: Statement, _rights: Right[]) {
  const rights = skipGroups(_rights);

  if (isDistributorStatement(statement)) {
    return rights.filter(r => r.rightholderId === statement.receiverId || r.contractId === statement.contractId);
  } else if (isProducerStatement(statement)) {
    return rights.filter(r => r.rightholderId !== statement.senderId && r.contractId === statement.contractId);
  } else if (isDirectSalesStatement(statement)) {
    return rights.filter(r => r.rightholderId === statement.senderId);
  }
}

/**
 * Return the rights that should be displayed on the statement view
 * @param statement 
 * @param _rights 
 * @returns 
 */
export function getStatementRightsToDisplay(statement: Statement, _rights: Right[]) {
  const rights = getStatementRights(statement, _rights);
  if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) return rights.filter(r => r.rightholderId === statement.senderId);
  if (isProducerStatement(statement)) return rights;
}

export function getStatementSources(statement: Statement, sources: WaterfallSource[], incomes: Income[], rights?: Right[], state?: TitleState) {
  if (statement.status === 'reported' || isProducerStatement(statement) || isDirectSalesStatement(statement)) {
    const statementIncomes = statement.incomeIds.map(id => incomes.find(i => i.id === id));
    return getIncomesSources(statementIncomes, sources);
  } else if (isDistributorStatement(statement)) {
    const rightholderRights = rights.filter(r => r.rightholderId === statement.senderId && r.contractId === statement.contractId)
      .filter(r => nodeExists(state, r.id));
    const topLevelRights = getTopLevelRights(rightholderRights, state);
    const sourceNodes = getSources(state, topLevelRights.map(r => r.id));
    const sourceIds = Array.from(sourceNodes.map(node => node.id));
    return sourceIds.map(id => sources.find(s => s.id === id));
  }
}

export function getAssociatedRights(sourceId: string, rights: Right[], state: TitleState) {
  if (!state.sources[sourceId]) return [];
  const rightsFromSource: Right[] = [];
  for (const right of rights) {
    const sources = getSources(state, right.id);
    if (sources.find(s => s.id === sourceId)) rightsFromSource.push(right);
  }

  return rightsFromSource;
}

/**
 * Order a subset of rights by their position between each others
 * @param rights 
 * @param state 
 * @returns 
 */
export function getOrderedRights(rights: Right[], state: TitleState) {
  if (rights.length === 1) return rights;
  return rights.sort((a, b) => pathExists(a.id, b.id, state) ? 1 : -1);
}

/**
 * For a subset of rights, return the enabled rights that are not children of any other right of this subset
 * Example: fetch top level rights of a right holder
 * @param _rights 
 * @param state 
 * @returns 
 */
function getTopLevelRights(_rights: Right[], state: TitleState) {
  if (!state) return [];
  // Skip groups and keep only enabled rights
  const enabledRights = skipGroups(_rights).filter(r => state.rights[r.id].enabled);

  // Keep only first child of vertical groups
  const firstChilds = getFirstChildOfVerticalGroups(enabledRights, state);
  const rights = enabledRights.filter(r => !isVerticalGroupChild(state, r.id)).concat(firstChilds);

  const topLevelRights: Right[] = [];
  for (const right of rights) {
    if (!rights.filter(r => r.id !== right.id).some(r => pathExists(right.id, r.id, state))) {
      topLevelRights.push(right);
    }
  }
  return topLevelRights;
}

function getFirstChildOfVerticalGroups(rights: Right[], state: TitleState) {
  const verticalRights = rights.filter(r => isVerticalGroupChild(state, r.id));
  const verticalGroupIds = Array.from(new Set(verticalRights.map(r => r.groupId)));
  const firstChilds: Right[] = [];
  for (const groupId of verticalGroupIds) {
    const childs = rights.filter(r => r.groupId === groupId).sort((a, b) => a.order - b.order);
    if (childs[0]) firstChilds.push(childs[0]);
  }

  return firstChilds;
}

function skipGroups(rights: Right[]) {
  // Groups are skipped here and revenue will be re-calculated from the childrens
  const groupRightTypes: RightType[] = ['horizontal', 'vertical'];
  return rights.filter(r => !groupRightTypes.includes(r.type));
}

/**
 * Look into transfer state to find the history transfers for this rightId and incomeIds
 * @param rightId 
 * @param _incomeIds 
 * @param transferState 
 */
function getTransfersHistory(rightId: string, _incomeIds: string[] | string, transferState: Record<string, TransferState>, options: { checked: boolean } = { checked: true }) {
  const incomeIds = Array.isArray(_incomeIds) ? _incomeIds : [_incomeIds];
  const transfers = Object.values(transferState).filter(t => t.to === rightId);
  const history = transfers.map(t => t.history.filter(h => incomeIds.includes(h.incomeId))).flat();
  return options.checked ? history.filter(h => h.checked) : history;
}

/**
 * Look into transfer state to find the transfered amount (turnover) to this rightId for this incomeIds
 * @param rightId 
 * @param _incomeIds 
 * @param transferState 
 * @returns number
 */
export function getIncomingAmount(rightId: string, incomeIds: string[] | string, transferState: Record<string, TransferState>): number {
  const history = getTransfersHistory(rightId, incomeIds, transferState, { checked: false });
  return sum(history, i => i.amount);
}

/**
 * Look into transfer state to find the calculated amount for this rightId and incomeIds
 * @param rightId 
 * @param _incomeIds 
 * @param transferState 
 * @returns number
 */
export function getCalculatedAmount(rightId: string, incomeIds: string[] | string, transferState: Record<string, TransferState>): number {
  const history = getTransfersHistory(rightId, incomeIds, transferState);
  return sum(history, i => i.amount * i.percent);
}

/**
 * Add payements to statement if missing
 * @param statement 
 * @param state 
 * @param rights 
 * @param incomes 
 * @param currency 
 * @returns 
 */
export function generatePayments(statement: Statement, state: TitleState, rights: Right[], incomes: Income[], currency = mainCurrency) {

  // Income payments 
  if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) {
    for (const incomeId of statement.incomeIds) {
      if (statement.payments.income.find(p => p.incomeId === incomeId)) continue;
      const income = incomes.find(i => i.id === incomeId);
      statement.payments.income.push(createIncomePayment({
        incomeId,
        price: income.price,
        currency: income.currency,
        date: statement.duration.to,
      }));
    }
  }

  // Right Payments
  for (const right of rights) {
    const paymentExists = statement.payments.right.find(p => p.to === right.id);
    if (paymentExists) continue;

    const isInternal = right.rightholderId === statement.senderId;
    const amountPerIncome = statement.incomeIds.map(incomeId => ({ incomeId, amount: getCalculatedAmount(right.id, incomeId, state.transfers) }));
    const payment = createRightPayment({
      to: right.id,
      price: sum(amountPerIncome, i => i.amount),
      currency,
      date: isInternal ? statement.duration.to : undefined,
      incomeIds: amountPerIncome.map(i => i.incomeId).filter(id => {
        const income = incomes.find(i => i.id === id);
        return pathExists(right.id, income.sourceId, state);
      }),
      mode: isInternal ? 'internal' : 'external'
    });

    statement.payments.right.push(payment);
  }

  // Rightholder Payments
  if ((isDistributorStatement(statement) || isProducerStatement(statement)) && !statement.payments.rightholder) {
    const price = getRightholderPaymentPrice(statement, state);
    const externalRights = rights.filter(r => r.rightholderId !== statement.senderId);

    // Sum of external right payments
    statement.payments.rightholder = createRightholderPayment({
      price: price,
      currency,
      date: undefined,
      incomeIds: statement.incomeIds.filter(id => {
        const income = incomes.find(i => i.id === id);
        return income.price > 0 && externalRights.some(r => pathExists(r.id, income.sourceId, state));
      })
    });
  }

  return statement;
}

function getRightholderPaymentPrice(statement: Statement, state: TitleState) {
  if (isDistributorStatement(statement)) {
    // Total income received
    const incomes = statement.incomeIds.map(id => state.incomes[id]);
    const incomeSum = sum(incomes, i => i.amount);
    // Total price of interal right payments
    const internalRightPaymentSum = sum(statement.payments.right.filter(r => r.mode === 'internal'), p => p.price);
    // What the rightholder did not take
    return incomeSum - internalRightPaymentSum;
  } else if (isProducerStatement(statement)) {
    // Total price of external right payments
    return sum(statement.payments.right.filter(r => r.mode === 'external'), p => p.price);
  }
}

export function createMissingIncomes(incomeSources: WaterfallSource[], statementIncomes: Income[], statement: Statement, waterfall: Waterfall) {
  const sourcesWithoutIncome = incomeSources.filter(s => !statementIncomes.find(i => i.sourceId === s.id));
  const missingIncomes: Income[] = [];
  for (const sourceWithoutIncome of sourcesWithoutIncome) {
    const income = createIncome({
      contractId: statement.contractId,
      price: 0,
      currency: mainCurrency,
      titleId: waterfall.id,
      date: statement.duration.to,
      medias: sourceWithoutIncome.medias,
      territories: sourceWithoutIncome.territories,
      sourceId: sourceWithoutIncome.id,
    });

    missingIncomes.push(income);
  }

  return missingIncomes;
}

export function hasRightsWithExpenseCondition(_rights: Right[], statement: Statement, waterfall: Waterfall) {
  const rights = _rights.filter(r => r.rightholderId === statement.senderId);
  return rights.some(r => getRightExpenseTypes(r, statement, waterfall).length > 0);
}

/**
 * Return expense types defined in conditions of a right
 * @param right 
 * @param statement
 * @param waterfall
 * @returns 
 */
function getRightExpenseTypes(right: Right, statement: Statement, waterfall: Waterfall) {
  const conditions = getRightCondition(right);
  const conditionsWithTarget = conditions.filter(c => isConditionWithTarget(c)) as ConditionWithTarget[];

  const expenseTargets = conditionsWithTarget
    .map(c => (typeof c.payload.target === 'object' && c.payload.target.in === 'expense') ? c.payload.target.id : undefined)
    .filter(id => !!id);

  /** 
  * @deprecated not used. Might be removed in future
  * If target "orgs.expense" in "targetIn" libs/model/src/lib/waterfall/conditions.ts is re-enabled, uncomment this code
  const [orgId] = conditionsWithTarget
    .map(c => (typeof c.payload.target === 'object' && c.payload.target.in === 'orgs.expense') ? c.payload.target.id : undefined)
    .filter(id => !!id);

  if (orgId) {
    // @dev target contract.expense instead of org.expense would be more appropriate.
    if (orgId !== statement.senderId) throw new Error(`Statement senderId ${statement.senderId} does not match expense target orgId ${orgId}`);
    const orgExpenseTargets = waterfall.expenseTypes[statement.contractId || 'directSales'].map(e => e.id);
    expenseTargets.push(...orgExpenseTargets);
  }*/

  return Array.from(expenseTargets);
}

export function convertStatementsTo(_statements: Statement[], version: Version) {
  if (!version?.id) return _statements;
  if (version.standalone) return _statements.filter(s => s.versionId === version.id);
  const statements = _statements.filter(s => !s.standalone);
  const duplicatedStatements = statements.filter(s => !!s.duplicatedFrom);
  const rootStatements = statements.filter(s => !s.duplicatedFrom);
  return rootStatements.map(s => duplicatedStatements.find(d => d.duplicatedFrom === s.id && d.versionId === version.id) || s);
}

export interface MaxPerIncome {
  income: Income;
  max: number;
  current: number;
  source: WaterfallSource
}

export interface BreakdownRow {
  section: string;
  type?: 'right' | 'net' | 'expense';
  previous: PricePerCurrency;
  current: PricePerCurrency;
  cumulated: PricePerCurrency;
  right?: Right;
  cap?: PricePerCurrency;
  maxPerIncome?: MaxPerIncome[];
}

export interface ProducerBreakdownRow {
  name: string;
  percent?: number;
  taken: number;
  type?: 'source' | 'total' | 'right';
  right?: Right;
  source?: WaterfallSource & { taken: number };
  maxPerIncome?: MaxPerIncome[];
}

export interface SourcesBreakdown {
  name: string;
  rows: BreakdownRow[];
  net: PricePerCurrency;
  stillToBeRecouped: PricePerCurrency;
}

export interface RightsBreakdown {
  name: string;
  rows: BreakdownRow[];
  total: PricePerCurrency;
  stillToBeRecouped: PricePerCurrency;
}

export interface GroupsBreakdown {
  group: Right;
  rights: Right[];
  rows: ProducerBreakdownRow[];
}

export interface DetailsRow {
  name: string,
  details: {
    from: string,
    fromId: string,
    to: string,
    amount: number,
    taken: number,
    percent: number,
  }[]
}

/**
 * For Distributor and Direct Sales statements.
 * @param versionId 
 * @param waterfall 
 * @param sources 
 * @param current 
 * @param incomes 
 * @param _expenses 
 * @param _history 
 * @param rights 
 * @param state 
 * @returns 
 */
export function getSourcesBreakdown(
  versionId: string,
  waterfall: Waterfall,
  sources: WaterfallSource[],
  current: Statement,
  incomes: Income[],
  _expenses: Expense[],
  _history: (Statement & { number: number })[],
  rights: Right[],
  state: TitleState): SourcesBreakdown[] {
  const indexOfCurrent = _history.findIndex(s => s.id === current.id || s.id === current.duplicatedFrom);
  _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
  const previous = _history.slice(indexOfCurrent + 1);
  const history = _history.slice(indexOfCurrent);

  const displayedRights = getStatementRightsToDisplay(current, rights);
  const orderedRights = getOrderedRights(displayedRights, state);
  const statementIncomes = incomes.filter(i => current.incomeIds.includes(i.id));
  const expenseTypes = isDirectSalesStatement(current) ? waterfall.expenseTypes.directSales : waterfall.expenseTypes[current.contractId];
  return sources.map(source => {
    const rows: BreakdownRow[] = [];

    // Remove sources where all incomes are hidden from reported statement 
    if (current.status === 'reported') {
      const sourceIncomes = statementIncomes.filter(i => i.sourceId === source.id);
      const allHidden = sourceIncomes.every(i => i.version[versionId]?.hidden);
      if (allHidden) return;
    }

    // Incomes declared by statement.senderId
    const previousSourcePayments = previous.map(s => s.payments.income).flat().filter(income => incomes.find(i => i.id === income.incomeId).sourceId === source.id);
    const currentSourcePayments = current.payments.income.filter(income => incomes.find(i => i.id === income.incomeId).sourceId === source.id);
    const cumulatedSourcePayments = history.map(s => s.payments.income).flat().filter(income => incomes.find(i => i.id === income.incomeId).sourceId === source.id);
    rows.push({
      section: 'Gross Receipts',
      previous: getTotalPerCurrency(previousSourcePayments),
      current: getTotalPerCurrency(currentSourcePayments),
      cumulated: getTotalPerCurrency(cumulatedSourcePayments)
    });

    const rights = orderedRights.filter(right => {
      const rightSources = getSources(state, right.id);
      return rightSources.length === 1 && rightSources[0].id === source.id;
    });

    // What senderId took from source to pay his rights
    const previousSum: RightPayment[] = [];
    const currentSum: RightPayment[] = [];
    const cumulatedSum: RightPayment[] = [];
    const stillToBeRecouped: { price: number, currency: MovieCurrency }[] = [];
    for (const right of rights) {
      const section = right.type ? `${right.name} (${toLabel(right.type, 'rightTypes')} - ${right.percent}%)` : `${right.name} (${right.percent}%)`;
      const previousRightPayment = previous.map(s => s.payments.right).flat().filter(p => p.to === right.id);
      previousSum.push(...previousRightPayment.map(r => ({ ...r, price: -r.price })));
      const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
      currentSum.push(...currentRightPayment.map(r => ({ ...r, price: -r.price })));
      const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);
      cumulatedSum.push(...cumulatedRightPayment.map(r => ({ ...r, price: -r.price })));

      const rightExpenseTypes = getRightExpenseTypes(right, current, waterfall);
      for (const expenseTypeId of rightExpenseTypes) {
        const expenseType = expenseTypes?.find(e => e.id === expenseTypeId);

        if (!expenseType) {
          if (isDirectSalesStatement(current)) {
            throw new Error(`Expense type id "${expenseTypeId}" used in conditions of "${right.name}" is not defined.`);
          } else {
            throw new Error(`Expense type id "${expenseTypeId}" used in conditions of "${right.name}" is not defined in contract "${current.contractId}".`);
          }
        }

        const currentExpenses = _expenses.filter(e => e.typeId === expenseTypeId && current.expenseIds.includes(e.id));
        const previousExpenses = _expenses.filter(e => e.typeId === expenseTypeId && previous.map(s => s.expenseIds).flat().includes(e.id));
        const cumulatedExpenses = _expenses.filter(e => e.typeId === expenseTypeId && history.map(s => s.expenseIds).flat().includes(e.id));

        const cap = current.versionId && expenseType.cap.version[current.versionId] ? expenseType.cap.version[current.versionId] : expenseType.cap.default;

        rows.push({
          section: expenseType.name,
          cap: cap > 0 ? { [expenseType.currency]: cap } : undefined,
          type: 'expense',
          previous: getTotalPerCurrency(previousExpenses),
          current: getTotalPerCurrency(currentExpenses),
          cumulated: getTotalPerCurrency(cumulatedExpenses)
        });

        stillToBeRecouped.push(...cumulatedExpenses);
      }

      if (rightExpenseTypes.length > 0) stillToBeRecouped.push(...cumulatedRightPayment.map(r => ({ currency: r.currency, price: -r.price })));

      const maxPerIncome = Array.from(new Set(currentRightPayment.map(r => r.incomeIds).flat())).map(incomeId => ({
        income: incomes.find(i => i.id === incomeId),
        max: getIncomingAmount(right.id, incomeId, state.transfers),
        current: getCalculatedAmount(right.id, incomeId, state.transfers),
        source
      })).filter(i => i.max > 0);

      rows.push({
        section,
        type: 'right',
        right,
        previous: getTotalPerCurrency(previousRightPayment),
        current: getTotalPerCurrency(currentRightPayment),
        cumulated: getTotalPerCurrency(cumulatedRightPayment),
        maxPerIncome
      });
    }

    // Net receipts
    const currentNet = getTotalPerCurrency([...currentSourcePayments, ...currentSum]);
    rows.push({
      section: `${source.name} (Net Receipts)`,
      type: 'net',
      previous: getTotalPerCurrency([...previousSourcePayments, ...previousSum]),
      current: currentNet,
      cumulated: getTotalPerCurrency([...cumulatedSourcePayments, ...cumulatedSum])
    });

    return {
      name: source.name,
      rows,
      net: currentNet,
      stillToBeRecouped: stillToBeRecouped.length ? getTotalPerCurrency(stillToBeRecouped) : undefined
    };
  }).filter(r => r);
}

/**
 * For Distributor and Direct Sales statements.
 * @param waterfall 
 * @param current 
 * @param incomes 
 * @param _expenses 
 * @param _history 
 * @param rights 
 * @param state 
 * @returns 
 */
export function getRightsBreakdown(
  waterfall: Waterfall,
  current: Statement,
  incomes: Income[],
  _expenses: Expense[],
  _history: (Statement & { number: number })[],
  rights: Right[],
  state: TitleState): RightsBreakdown[] {

  const indexOfCurrent = _history.findIndex(s => s.id === current.id || s.id === current.duplicatedFrom);
  _history[indexOfCurrent] = { ...current, number: _history[indexOfCurrent].number };
  const previous = _history.slice(indexOfCurrent + 1);
  const history = _history.slice(indexOfCurrent);

  const displayedRights = getStatementRightsToDisplay(current, rights);
  const orderedRights = getOrderedRights(displayedRights, state);
  const rightsWithManySources = orderedRights.filter(right => getSources(state, right.id).length > 1);

  const rightTypes = Array.from(new Set(rightsWithManySources.map(right => right.type)));
  const expenseTypes = isDirectSalesStatement(current) ? waterfall.expenseTypes.directSales : waterfall.expenseTypes[current.contractId];
  return rightTypes.map(type => {
    const rows: BreakdownRow[] = [];

    const stillToBeRecouped: { price: number, currency: MovieCurrency }[] = [];
    for (const right of rightsWithManySources) {
      if (right.type !== type) continue;

      const section = `${right.name} (${right.percent}%)`;
      const previousRightPayment = previous.map(s => s.payments.right).flat().filter(p => p.to === right.id);
      const currentRightPayment = current.payments.right.filter(p => p.to === right.id);
      const cumulatedRightPayment = history.map(s => s.payments.right).flat().filter(p => p.to === right.id);

      const rightExpenseTypes = getRightExpenseTypes(right, current, waterfall);
      for (const expenseTypeId of rightExpenseTypes) {
        const expenseType = expenseTypes?.find(e => e.id === expenseTypeId);

        if (!expenseType) {
          if (isDirectSalesStatement(current)) {
            throw new Error(`Expense type id "${expenseTypeId}" used in conditions of "${right.name}" is not defined.`);
          } else {
            throw new Error(`Expense type id "${expenseTypeId}" used in conditions of "${right.name}" is not defined in contract "${current.contractId}".`);
          }
        }

        const currentExpenses = _expenses.filter(e => e.typeId === expenseTypeId && current.expenseIds.includes(e.id));
        const previousExpenses = _expenses.filter(e => e.typeId === expenseTypeId && previous.map(s => s.expenseIds).flat().includes(e.id));
        const cumulatedExpenses = _expenses.filter(e => e.typeId === expenseTypeId && history.map(s => s.expenseIds).flat().includes(e.id));

        const cap = current.versionId && expenseType.cap.version[current.versionId] ? expenseType.cap.version[current.versionId] : expenseType.cap.default;

        rows.push({
          section: expenseType.name,
          cap: cap > 0 ? { [expenseType.currency]: cap } : undefined,
          type: 'expense',
          previous: getTotalPerCurrency(previousExpenses),
          current: getTotalPerCurrency(currentExpenses),
          cumulated: getTotalPerCurrency(cumulatedExpenses)
        });

        stillToBeRecouped.push(...cumulatedExpenses);
      }

      if (rightExpenseTypes.length > 0) stillToBeRecouped.push(...cumulatedRightPayment.map(r => ({ currency: r.currency, price: -r.price })));

      const maxPerIncome = Array.from(new Set(currentRightPayment.map(r => r.incomeIds).flat()))
        .map(incomeId => incomes.find(i => i.id === incomeId))
        .map(income => ({
          income,
          max: getIncomingAmount(right.id, income.id, state.transfers),
          current: getCalculatedAmount(right.id, income.id, state.transfers),
          source: waterfall.sources.find(s => s.id === income.sourceId)
        })).filter(i => i.max > 0);

      rows.push({
        section,
        type: 'right',
        right,
        previous: getTotalPerCurrency(previousRightPayment),
        current: getTotalPerCurrency(currentRightPayment),
        cumulated: getTotalPerCurrency(cumulatedRightPayment),
        maxPerIncome
      });
    }

    const total = rows.filter(r => r.type === 'right').map(r => r.current).reduce((acc, curr) => {
      for (const currency of Object.keys(curr)) {
        acc[currency] = (acc[currency] || 0) + curr[currency];
      }
      return acc;
    }, {});

    return {
      name: toLabel(type, 'rightTypes'),
      rows,
      total,
      stillToBeRecouped: stillToBeRecouped.length ? getTotalPerCurrency(stillToBeRecouped) : undefined
    };
  });
}

