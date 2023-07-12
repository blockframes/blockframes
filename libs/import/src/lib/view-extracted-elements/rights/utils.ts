import { RightsImportState } from '@blockframes/import/utils';
import { ActionList, ActionName, App, Block, WaterfallRightholder, createRight } from '@blockframes/model';
import { extract, SheetTab } from '@blockframes/utils/spreadsheet';
import { FieldsConfig, getRightConfig } from './fieldConfigs';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

export interface FormatConfig {
  app: App;
}

export async function formatRight(
  sheetTab: SheetTab,
  waterfallService: WaterfallService,
) {
  // Cache to avoid  querying db every time
  const rightholderCache: Record<string, WaterfallRightholder[]> = {};
  const caches = { rightholderCache };

  const option = {
    waterfallService,
    caches,
  };

  const rights: RightsImportState[] = [];

  const fieldsConfig = getRightConfig(option);

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig);
  for (const result of results) {
    const { data, errors } = result;

    const actionName: ActionName = data.right.groupId ? 'appendHorizontal' : 'append';

    const right = createRight({ ...data.right, actionName });

    rights.push({ waterfallId: data.waterfallId, right, errors });
  }
  return rights;
}
