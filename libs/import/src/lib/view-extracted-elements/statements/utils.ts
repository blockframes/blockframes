import { StatementsImportState } from '../../utils';
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
  WaterfallContract
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

    if (!isDirectSalesStatement(statement)) {
      const document = await waterfallDocumentsService.getValue(data.contractId, { waterfallId: statement.waterfallId });
      const contract = convertDocumentTo<WaterfallContract>(document);
      const otherParty = contract.sellerId === statement.senderId ? contract.buyerId : contract.sellerId;
      statement.receiverId = otherParty;
      statement.contractId = data.contractId;
    } else {
      statement.receiverId = statement.senderId;
    };

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

      // If sourceId is defined, income does not need territories & medias
      if (income.sourceId) {
        income.territories = [];
        income.medias = [];
      }

      income.contractId = isDistributorStatement(statement) ? statement.contractId : undefined;
      income.date = statement.duration.to;
      income.titleId = statement.waterfallId;

      return income;
    });

    const expenses = data.expenses.filter(e => e.price && e.currency).map(e => {
      if (!e.id) e.id = waterfallService.createId();
      const expense = createExpense({ ...e });
      if (isDistributorStatement(statement) || isDirectSalesStatement(statement)) statement.expenseIds.push(expense.id);
      expense.contractId = isDistributorStatement(statement) ? statement.contractId : undefined;
      expense.rightholderId = statement.senderId;
      expense.date = statement.duration.to;
      expense.titleId = statement.waterfallId;

      return expense;
    });

    statements.push({ statement, incomes, expenses, errors });
  }
  return statements;
}
