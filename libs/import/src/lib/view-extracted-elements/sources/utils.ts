import { SourcesImportState } from '../../utils';
import { App, Movie, createWaterfallSource } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getSourceConfig } from './fieldConfigs';
import { MovieService } from '@blockframes/movie/service';

export interface FormatConfig {
  app: App;
}

export async function formatSource(
  sheetTab: SheetTab,
  titleService: MovieService,
  userOrgId: string,
) {

  // Cache to avoid  querying db every time
  const titleCache: Record<string, Movie> = {};
  const caches = { titleCache };

  const sources: SourcesImportState[] = [];
  const option = {
    titleService,
    userOrgId,
    caches,
    separator: ';'
  };
  const fieldsConfig = getSourceConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const { territories_included, territories_excluded } = data.source;
    delete data.source.territories_included;
    delete data.source.territories_excluded;

    const territories = territories_included ?
      territories_included.filter(territory => !territories_excluded?.includes(territory)) :
      [];

    const source = createWaterfallSource({ ...data.source, territories });
    sources.push({ source, waterfallId: data.waterfallId, errors });
  }
  return sources;
}
