import { ExpensesImportState } from '@blockframes/import/utils';
import { App, createExpense } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getExpenseConfig } from './fieldConfigs';

export interface FormatConfig {
  app: App;
}

export async function formatExpense(sheetTab: SheetTab) {
  const expenses: ExpensesImportState[] = [];
  const fieldsConfig = getExpenseConfig();

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const expense = createExpense({ ...data.expense });
    expenses.push({ expense, errors });
  }
  return expenses;
}
