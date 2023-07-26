import { getTitleId, mandatoryError, unknownEntityError } from '../../utils';
import { Media, Territory, Movie } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { ExtractConfig, getGroupedList } from '@blockframes/utils/spreadsheet';

export interface FieldsConfig {
  source: {
    id: string;
    name: string;
    territories_included: Territory[];
    territories_excluded: Territory[];
    medias: Media[];
    destinationIds: string[];
  };
  waterfallId: string;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;

interface Caches {
  titleCache: Record<string, Movie>,
}

interface SourceConfig {
  titleService: MovieService,
  userOrgId: string,
  caches: Caches,
  separator: string,
}

export function getSourceConfig(option: SourceConfig) {
  const {
    titleService,
    userOrgId,
    caches,
    separator
  } = option;

  const { titleCache } = caches;

  function getAdminConfig(): FieldsConfigType {
    // ! The order of the property should be the same as excel columns
    return {
        /* a */ 'waterfallId': async (value: string) => {
        if (!value) {
          throw mandatoryError(value, 'Waterfall ID');
        }
        const titleId = await getTitleId(value.trim(), titleService, titleCache, userOrgId, true);
        if (titleId) return titleId;
        throw unknownEntityError<string>(value, 'Waterfall name or ID');
      },
        /* b */ 'source.id': (value: string) => {
        return value;
      },
        /* c */ 'source.name': (value: string) => {
        return value;
      },
        /* d */ 'source.territories_included': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* e */ 'source.territories_excluded': (value: string) => getGroupedList(value, 'territories', separator, { required: false }),
        /* f */ 'source.medias': (value: string) => getGroupedList(value, 'medias', separator, { required: false }),
        /* g */ 'source.destinationIds': (value: string) => {
        return value.split(separator).filter(v => !!v).map(v => v.trim());
      },
    };
  }

  return getAdminConfig();
}
