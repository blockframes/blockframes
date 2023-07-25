import { SourcesImportState } from '@blockframes/import/utils';
import { App, Movie, createRight, createWaterfallSource } from '@blockframes/model';
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

    const group = createGroup(data.source.destinationIds);
    const destinationId = group ? group.right.id : data.source.destinationIds[0];
    delete data.source.destinationIds;

    const territories = territories_included ?
      territories_included.filter(territory => !territories_excluded?.includes(territory)) :
      [];

    const source = createWaterfallSource({ ...data.source, territories, destinationId });
    sources.push({ source, waterfallId: data.waterfallId, group, errors });
  }
  return sources;
}

function createGroup(destinationIds: string[]) {
  if (destinationIds.length === 1) return;

  // TODO #9420 carefull not to generate duplicate group Ids
  const groupId = `grp-${destinationIds.map(id => id.replace('_', '').substring(0, 3)).join('-')}`;
  return {
    right: createRight({ id: groupId, actionName: 'appendHorizontal' }),
    childs: destinationIds.map(id => createRight({ id, groupId }))
  }
}
