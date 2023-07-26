import { IncomesImportState } from '@blockframes/import/utils';
import { App, Movie, createIncome } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getIncomeConfig } from './fieldConfigs';
import { MovieService } from '@blockframes/movie/service';

export interface FormatConfig {
  app: App;
}

export async function formatIncome(
  sheetTab: SheetTab,
  titleService: MovieService,
  userOrgId: string,
) {
  const incomes: IncomesImportState[] = [];

  // Cache to avoid  querying db every time
  const titleCache: Record<string, Movie> = {};
  const caches = { titleCache };

  const option = { 
    titleService,
    userOrgId,
    caches,
    separator: ';'
  };
  const fieldsConfig = getIncomeConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const { territories_included, territories_excluded } = data.income;
    delete data.income.territories_included;
    delete data.income.territories_excluded;

    const territories = territories_included ?
      territories_included.filter(territory => !territories_excluded?.includes(territory)) :
      [];

    const income = createIncome({ ...data.income, territories, status: 'processed' });

    // If sourceId is defined, income does not need territories & medias
    if(income.sourceId) {
      income.territories = [];
      income.medias = [];
    }
    
    incomes.push({ income, errors });
  }
  return incomes;
}
