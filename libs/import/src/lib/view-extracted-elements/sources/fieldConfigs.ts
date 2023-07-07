import { Media, Territory } from '@blockframes/model';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';

export interface FieldsConfig {
  source: {
    id: string;
    name: string;
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    destinationId: string;
  };
  waterfallId: string;
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface SourceConfig {
  separator: string,
}

export function getSourceConfig(option: SourceConfig) {
  const { separator } = option;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'waterfallId': async (value: string) => {
        return value;
      },
        /* b */ 'source.id': async (value: string) => {
        return value;
      },
        /* c */ 'source.name': async (value: string) => {
        return value;
      },
        /* d */ 'source.territories_included': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* e */ 'source.territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'source.medias': (value: string) => getGroupedList(value, 'medias', separator, { required: false }),

        /* g */ 'source.destinationId': async (value: string) => {
        return value;
      },
    };
  }

  return getAdminConfig();
}
