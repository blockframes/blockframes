import { StatementsImportState, valueToId } from '../../utils';
import {
  App,
  Movie,
  WaterfallRightholder,
  createStatement,
  createIncome,
  isDistributorStatement,
  createExpense,
  isDirectSalesStatement,
  convertDocumentTo,
  WaterfallContract,
  ExpenseType,
  createExpenseType,
  waterfallSources,
  getDefaultVersionId,
  allOf
} from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getStatementConfig } from './fieldConfigs';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { StatementService } from '@blockframes/waterfall/statement.service';
import { IncomeService } from '@blockframes/contract/income/service';
import { ExpenseService } from '@blockframes/contract/expense/service';
import { WaterfallDocumentsService } from '@blockframes/waterfall/documents.service';

export interface FormatConfig {
  app: App;
}

export async function formatStatement(
  sheetTab: SheetTab,
  waterfallService: WaterfallService,
  titleService: MovieService,
  statementService: StatementService,
  incomeService: IncomeService,
  expenseService: ExpenseService,
  waterfallDocumentsService: WaterfallDocumentsService,
  userOrgId: string,
) {
  const statements: StatementsImportState[] = [];

  // Cache to avoid  querying db every time
  const rightholderCache: Record<string, WaterfallRightholder[]> = {};
  const titleCache: Record<string, Movie> = {};
  const caches = { rightholderCache, titleCache };

  const expenseTypes: Record<string, ExpenseType[]> = {};

  const option = {
    waterfallService,
    titleService,
    statementService,
    incomeService,
    expenseService,
    userOrgId,
    caches,
    separator: ';'
  };
  const fieldsConfig = getStatementConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;

    // prevents crash if no type is defined
    if (!data.statement.type) data.statement.type = 'mainDistributor';

    const statement = createStatement(data.statement);
    const waterfall = await waterfallService.getValue(statement.waterfallId);
    const defaultVersion = getDefaultVersionId(waterfall);
    const sources = waterfallSources(waterfall, defaultVersion);

    if (!isDirectSalesStatement(statement)) {
      const document = await waterfallDocumentsService.getValue(data.contractId, { waterfallId: statement.waterfallId });
      const contract = convertDocumentTo<WaterfallContract>(document);
      const otherParty = contract.sellerId === statement.senderId ? contract.buyerId : contract.sellerId;
      statement.receiverId = otherParty;
      statement.contractId = data.contractId;
    } else {
      statement.receiverId = statement.senderId;
    }

    const incomes = data.incomes.filter(i => i.price && i.currency).map(i => {
      const { territories_included, territories_excluded } = i;
      delete i.territories_included;
      delete i.territories_excluded;

      const territories = territories_included ?
        territories_included.filter(territory => !territories_excluded?.includes(territory)) :
        [];

      if (!i.id) i.id = waterfallService.createId();
      if (i.salesContractId && isDistributorStatement(statement)) {
        if (!statement.additional.salesContractIds) statement.additional.salesContractIds = [];
        statement.additional.salesContractIds.push({ incomeId: i.id, contractId: i.salesContractId });
        delete i.salesContractId;
      }

      const income = createIncome({ ...i, territories });

      statement.incomeIds.push(income.id);

      // If sourceId is not defined, sourceId is found by matching territories and medias
      if (!income.sourceId) {
        const candidates = sources.filter(source => allOf(income.territories).in(source.territories) && allOf(income.medias).in(source.medias));
        if (candidates.length === 0) {
          errors.push({
            type: 'error',
            name: 'Invalid source.',
            reason: `Could not find source for income "${income.id}"`,
            message: 'Check territories and medias or set source ID.'
          });
        } else if (candidates.length > 1) {
          errors.push({
            type: 'error',
            name: 'Invalid source.',
            reason: `Too many sources matching income "${income.id}" : ${candidates.map(c => c.id).join(',')}`,
            message: 'Check territories and medias or set source ID.'
          });
        } else {
          income.sourceId = candidates[0].id;
        }
      }

      income.contractId = isDistributorStatement(statement) ? statement.contractId : undefined;
      income.date = statement.duration.to;
      income.titleId = statement.waterfallId;

      return income;
    });

    const expenses = data.expenses.filter(e => e.price && e.currency).map(e => {
      if (!e.id) e.id = waterfallService.createId();
      const expense = createExpense({ ...e });
      delete (expense as any).cap;
      if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) statement.expenseIds.push(expense.id);
      const typeId = valueToId(e.typeId);
      expense.contractId = isDistributorStatement(statement) ? statement.contractId : undefined;
      expense.rightholderId = statement.senderId;
      expense.date = statement.duration.to;
      expense.titleId = statement.waterfallId;
      expense.typeId = typeId;

      // Create expense types
      const contractId = isDirectSalesStatement(statement) ? 'directSales' : expense.contractId;
      if (!expenseTypes[contractId]) expenseTypes[contractId] = [];
      if (!expenseTypes[contractId].find(t => t.id === typeId)) {
        expenseTypes[contractId].push(createExpenseType({
          id: typeId,
          contractId,
          currency: e.currency,
          name: e.typeId,
          cap: { default: e.cap, version: {} }
        }));
      }
      return expense;
    });

    statements.push({ statement, incomes, expenses, expenseTypes, errors });
  }
  return statements;
}
