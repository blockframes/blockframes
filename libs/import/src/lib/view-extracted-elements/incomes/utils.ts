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

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const {
      territories_included,
      territories_excluded
    } = data.income;
    delete data.income.territories_included;
    delete data.income.territories_excluded;

    const territories = territories_included.filter(territory => !territories_excluded.includes(territory));
    const income = createIncome({ ...data.income, territories });
    incomes.push({ income, errors });
  }
  return incomes;
}
