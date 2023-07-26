import { ExpensesImportState } from '../../utils';
import { App, Movie, createExpense } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getExpenseConfig } from './fieldConfigs';
import { MovieService } from '@blockframes/movie/service';

export interface FormatConfig {
  app: App;
}

export async function formatExpense(
  sheetTab: SheetTab,
  titleService: MovieService,
  userOrgId: string,
) {
  const expenses: ExpensesImportState[] = [];

  // Cache to avoid  querying db every time
  const titleCache: Record<string, Movie> = {};
  const caches = { titleCache };

  const option = {
    titleService,
    userOrgId,
    caches,
  };
  const fieldsConfig = getExpenseConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const expense = createExpense({ ...data.expense });
    expenses.push({ expense, errors });
  }
  return expenses;
}
