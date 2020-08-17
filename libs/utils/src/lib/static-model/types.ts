import models from './staticModels';
import constants from './staticConsts';

// TYPE FOR MODELS

export const GENRES_SLUG = models['GENRES'].map(key => key.slug);
export type GenresSlug = typeof GENRES_SLUG[number];

export const PRODUCER_ROLES_SLUG = models['PRODUCER_ROLES'].map(key => key.slug);
export type ProducerRolesSlug = typeof PRODUCER_ROLES_SLUG[number];

export const CAST_ROLES_SLUG = models['CAST_ROLES'].map(key => key.slug);
export type CastRolesSlug = typeof CAST_ROLES_SLUG[number];

export const CREW_ROLES_SLUG = models['CREW_ROLES'].map(key => key.slug);
export type CrewRolesSlug = typeof CREW_ROLES_SLUG[number];

export const MOVIE_STATUS_LABEL = models['MOVIE_STATUS'].map(key => key.label);
export const MOVIE_STATUS_SLUG = models['MOVIE_STATUS'].map(key => key.slug);
export type MovieStatusLabel = typeof MOVIE_STATUS_LABEL[number];
export type MovieStatusSlug = typeof MOVIE_STATUS_SLUG[number];

export const LANGUAGES_LABEL = models['LANGUAGES'].map(key => key.label);
export const LANGUAGES_SLUG = models['LANGUAGES'].map(key => key.slug);
export type LanguagesLabel = typeof LANGUAGES_LABEL[number];
export type LanguagesSlug = typeof LANGUAGES_SLUG[number];

export const MOVIE_CURRENCIES_SLUG = models['MOVIE_CURRENCIES'].map(key => key.slug);
export type MovieCurrenciesSlug = typeof MOVIE_CURRENCIES_SLUG[number];

export const SCORING_SLUG = models['SCORING'].map(key => key.slug);
export type ScoringSlug = typeof SCORING_SLUG[number];

export const RATING_SLUG = models['RATING'].map(key => key.slug);
export type RatingSlug = typeof RATING_SLUG[number];

export const COLORS_SLUG = models['COLORS'].map(key => key.slug);
export type ColorsSlug = typeof COLORS_SLUG[number];

export const CERTIFICATIONS_LABEL = models['CERTIFICATIONS'].map(key => key.label);
export const CERTIFICATIONS_SLUG = models['CERTIFICATIONS'].map(key => key.slug);
export type CertificationsLabel = typeof CERTIFICATIONS_LABEL[number];
export type CertificationsSlug = typeof CERTIFICATIONS_SLUG[number];

export const TERRITORIES_LABEL = models['TERRITORIES'].map(key => key.label);
export const TERRITORIES_SLUG = models['TERRITORIES'].map(key => key.slug);
export type TerritoriesLabel = typeof TERRITORIES_LABEL[number];
export type TerritoriesSlug = typeof TERRITORIES_SLUG[number];

export const MEDIAS_SLUG = models['MEDIAS'].map(key => key.slug);
export type MediasSlug = typeof MEDIAS_SLUG[number];

export const RESOURCE_SIZES_SLUG = models['RESOURCE_SIZES'].map(key => key.slug);
export type ResourceSizesSlug = typeof RESOURCE_SIZES_SLUG[number];

export const RESOURCE_RATIOS_SLUG = models['RESOURCE_RATIOS'].map(key => key.slug);
export type ResourceRatioSlug = typeof RESOURCE_RATIOS_SLUG[number];

export const LEGAL_ROLES_SLUG = models['LEGAL_ROLES'].map(key => key.slug);
export type LegalRolesSlug = typeof LEGAL_ROLES_SLUG[number];

export const SUB_LICENSOR_ROLES_SLUG = models['SUB_LICENSOR_ROLES'].map(key => key.slug);
export type SubLicensorRoleSlug = typeof SUB_LICENSOR_ROLES_SLUG[number];

export const MOVIE_FORMAT_LABEL = models['MOVIE_FORMAT'].map(key => key.label);
export const MOVIE_FORMAT_SLUG = models['MOVIE_FORMAT'].map(key => key.slug);
export type FormatLabel = typeof MOVIE_FORMAT_LABEL[number];
export type FormatSlug = typeof MOVIE_FORMAT_SLUG[number];

export const MOVIE_FORMAT_QUALITY_SLUG = models['MOVIE_FORMAT_QUALITY'].map(key => key.slug);
export type FormatQualitySlug = typeof MOVIE_FORMAT_QUALITY_SLUG[number];

export const SOUND_FORMAT_SLUG = models['SOUND_FORMAT'].map(key => key.slug);
export type SoundFormatSlug = typeof SOUND_FORMAT_SLUG[number];

export const STORE_TYPE_SLUG = models['STORE_TYPE'].map(key => key.slug);
export type StoreTypeSlug = typeof STORE_TYPE_SLUG[number];


// TYPE FOR CONSTANTS

export type ContentType = keyof typeof constants.contentType;
export type ContentTypeValue = typeof constants.contentType[ContentType];

export type StoreType = keyof typeof constants.storeType;
export type StoreTypeValue = typeof constants.storeType[StoreType];

export type PremiereType = keyof typeof constants.premiereType;
export type PremiereTypeValue = typeof constants.premiereType[PremiereType];

export type UnitBox = keyof typeof constants.unitBox;
export type UnitBoxValue = typeof constants.unitBox[UnitBox];

export type StoreStatus = keyof typeof constants.storeStatus;
export type StoreStatusValue = typeof constants.storeStatus[StoreStatus];

export type MovieLanguageTypes = keyof typeof constants.movieLanguageTypes;
export type MovieLanguageTypesValue = typeof constants.movieLanguageTypes[MovieLanguageTypes];
