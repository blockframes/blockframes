import { IncomesImportState } from '@blockframes/import/utils';
import { App, createIncome } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getIncomeConfig } from './fieldConfigs';

export interface FormatConfig {
  app: App;
}

export async function formatIncome(sheetTab: SheetTab) {
  const incomes: IncomesImportState[] = [];
  const option = { separator: ';' };
  const fieldsConfig = getIncomeConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 11);
  for (const result of results) {
    const { data, errors } = result;
    const income = createIncome(data.income);

    incomes.push({ income, errors });
  }
  return incomes;
}
