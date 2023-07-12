import { getRightholderId, mandatoryError } from '@blockframes/import/utils';
import { Right, WaterfallRightholder } from '@blockframes/model';
import { ExtractConfig } from '@blockframes/utils/spreadsheet';
import { BlockService } from '@blockframes/waterfall/block.service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';

export interface FieldsConfig {
  waterfallId: string;
  right: Right;
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  rightholderCache: Record<string, WaterfallRightholder[]>,
}

interface RightConfig {
  waterfallService: WaterfallService,
  caches: Caches,
}

export function getRightConfig(option: RightConfig) {
  const {
    waterfallService,
    caches,
  } = option;

  const { rightholderCache } = caches;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'waterfallId': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Waterfall Id');
        return value;
      },
        /* b */ 'right.groupId': async (value: string) => {
        return value;
      },
        /* c */ 'right.groupPercent': async (value: string) => {
        return Number(value);
      },
        /* d */ 'right.id': async (value: string) => {
        if (!value) throw mandatoryError(value, 'Right Id');
        return value;
      },
        /* e */ 'right.previousId': async (value: string) => {
        return value;
      },
        /* f */ 'right.rightholderId': async (value: string, data: FieldsConfig) => {
        if (!value) throw mandatoryError(value, 'Licensor');
        const rightholderId = await getRightholderId(value, data.waterfallId, waterfallService, rightholderCache);
        return rightholderId;
      },
        /* g */ 'right.percent': async (value: string) => {
        return Number(value);
      },

    };
  }

  return getAdminConfig();
}