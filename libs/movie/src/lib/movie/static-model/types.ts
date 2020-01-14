import models from './staticModels';

export const GENRES_LABEL = models['GENRES'].map(key => key.label);
export const GENRES_SLUG = models['GENRES'].map(key => key.slug);

export type GenresLabel = typeof GENRES_LABEL[number];
export type GenresSlug = typeof GENRES_SLUG[number];

export const STAKEHOLDER_ROLES_LABEL = models['STAKEHOLDER_ROLES'].map(key => key.label);
export const STAKEHOLDER_ROLES_SLUG = models['STAKEHOLDER_ROLES'].map(key => key.slug);

export type StakeholderRolesLabel = typeof STAKEHOLDER_ROLES_LABEL[number];
export type StakeholderRolesSlug = typeof STAKEHOLDER_ROLES_SLUG[number];

export const STAKEHOLDER_DELIVERY_AUTHORIZATIONS_LABEL = models[
  'STAKEHOLDER_DELIVERY_AUTHORIZATIONS'
].map(key => key.label);
export const STAKEHOLDER_DELIVERY_AUTHORIZATIONS_SLUG = models[
  'STAKEHOLDER_DELIVERY_AUTHORIZATIONS'
].map(key => key.slug);

export type StakeholderDeliveryAuthorizationsLabel = typeof STAKEHOLDER_DELIVERY_AUTHORIZATIONS_LABEL[number];
export type StakeholderDeliveryAuthorizationsSlug = typeof STAKEHOLDER_DELIVERY_AUTHORIZATIONS_SLUG[number];

export const CREDIT_ROLES_LABEL = models['CREDIT_ROLES'].map(key => key.label);
export const CREDIT_ROLES_SLUG = models['CREDIT_ROLES'].map(key => key.slug);

export type CreditRolesLabel = typeof CREDIT_ROLES_LABEL[number];
export type CreditRolesSlug = typeof CREDIT_ROLES_SLUG[number];

export const MOVIE_STATUS_LABEL = models['MOVIE_STATUS'].map(key => key.label);
export const MOVIE_STATUS_SLUG = models['MOVIE_STATUS'].map(key => key.slug);

export type MovieStatusLabel = typeof MOVIE_STATUS_LABEL[number];
export type MovieStatusSlug = typeof MOVIE_STATUS_SLUG[number];

export const LANGUAGES_LABEL = models['LANGUAGES'].map(key => key.label);
export const LANGUAGES_SLUG = models['LANGUAGES'].map(key => key.slug);

export type LanguagesLabel = typeof LANGUAGES_LABEL[number];
export type LanguagesSlug = typeof LANGUAGES_SLUG[number];

export const MOVIE_CURRENCIES_LABEL = models['MOVIE_CURRENCIES'].map(key => key.label);
export const MOVIE_CURRENCIES_SLUG = models['MOVIE_CURRENCIES'].map(key => key.slug);
export const MOVIE_CURRENCIES_CODE = models['MOVIE_CURRENCIES'].map(key => key.code);

export type MovieCurrenciesLabel = typeof MOVIE_CURRENCIES_LABEL[number];
export type MovieCurrenciesSlug = typeof MOVIE_CURRENCIES_SLUG[number];
export type MovieCurrenciesCode = typeof MOVIE_CURRENCIES_CODE[number];

export const SELECTION_CATEGORIES_LABEL = models['SELECTION_CATEGORIES'].map(key => key.label);
export const SELECTION_CATEGORIES_SLUG = models['SELECTION_CATEGORIES'].map(key => key.slug);

export type SelectionCategoriesLabel = typeof SELECTION_CATEGORIES_LABEL[number];
export type SelectionCategoriesSlug = typeof SELECTION_CATEGORIES_SLUG[number];

export const SCORING_LABEL = models['SCORING'].map(key => key.label);
export const SCORING_SLUG = models['SCORING'].map(key => key.slug);

export type ScoringLabel = typeof SCORING_LABEL[number];
export type ScoringSlug = typeof SCORING_SLUG[number];

export const RATING_LABEL = models['RATING'].map(key => key.label);
export const RATING_SLUG = models['RATING'].map(key => key.slug);

export type RatingLabel = typeof RATING_LABEL[number];
export type RatingSlug = typeof RATING_SLUG[number];

export const COLORS_LABEL = models['COLORS'].map(key => key.label);
export const COLORS_SLUG = models['COLORS'].map(key => key.slug);

export type ColorsLabel = typeof COLORS_LABEL[number];
export type ColorsSlug = typeof COLORS_SLUG[number];

export const CERTIFICATIONS_LABEL = models['CERTIFICATIONS'].map(key => key.label);
export const CERTIFICATIONS_SLUG = models['CERTIFICATIONS'].map(key => key.slug);

export type CertificationsLabel = typeof CERTIFICATIONS_LABEL[number];
export type CertificationsSlug = typeof CERTIFICATIONS_SLUG[number];

export const TERRITORIES_LABEL = models['TERRITORIES'].map(key => key.label);
export const TERRITORIES_SLUG = models['TERRITORIES'].map(key => key.slug);

export type TerritoriesLabel = typeof TERRITORIES_LABEL[number];
export type TerritoriesSlug = typeof TERRITORIES_SLUG[number];

export const MEDIAS_LABEL = models['MEDIAS'].map(key => key.label);
export const MEDIAS_SLUG = models['MEDIAS'].map(key => key.slug);

export type MediasLabel = typeof MEDIAS_LABEL[number];
export type MediasSlug = typeof MEDIAS_SLUG[number];

export const PROMOTIONAL_ELEMENT_TYPES_LABEL = models['PROMOTIONAL_ELEMENT_TYPES'].map(key => key.label);
export const PROMOTIONAL_ELEMENT_TYPES_SLUG = models['PROMOTIONAL_ELEMENT_TYPES'].map(key => key.slug);

export type PromotionalElementTypesLabel = typeof PROMOTIONAL_ELEMENT_TYPES_LABEL[number];
export type PromotionalElementTypesSlug = typeof PROMOTIONAL_ELEMENT_TYPES_SLUG[number];

export const RESOURCE_SIZES_LABEL = models['RESOURCE_SIZES'].map(key => key.label);
export const RESOURCE_SIZES_SLUG = models['RESOURCE_SIZES'].map(key => key.slug);

export type ResourceSizesLabel = typeof RESOURCE_SIZES_LABEL[number];
export type ResourceSizesSlug = typeof RESOURCE_SIZES_SLUG[number];

export const RESOURCE_RATIOS_LABEL = models['RESOURCE_RATIOS'].map(key => key.label);
export const RESOURCE_RATIOS_SLUG = models['RESOURCE_RATIOS'].map(key => key.slug);

export type ResourceRatioLabel = typeof RESOURCE_RATIOS_LABEL[number];
export type ResourceRatioSlug = typeof RESOURCE_RATIOS_SLUG[number];

export const LEGAL_ROLES_LABEL = models['LEGAL_ROLES'].map(key => key.label);
export const LEGAL_ROLES_SLUG = models['LEGAL_ROLES'].map(key => key.slug);

export type LegalRolesLabel = typeof LEGAL_ROLES_LABEL[number];
export type LegalRolesSlug = typeof LEGAL_ROLES_SLUG[number];

export const MOVIE_FORMAT_LABEL = models['MOVIE_FORMAT'].map(key => key.label);
export const MOVIE_FORMAT_SLUG = models['MOVIE_FORMAT'].map(key => key.slug);

export type FormatLabel = typeof MOVIE_FORMAT_LABEL[number];
export type FormatSlug = typeof MOVIE_FORMAT_SLUG[number];

export const MOVIE_FORMAT_QUALITY_LABEL = models['MOVIE_FORMAT_QUALITY'].map(key => key.label);
export const MOVIE_FORMAT_QUALITY_SLUG = models['MOVIE_FORMAT_QUALITY'].map(key => key.slug);

export type FormatQualityLabel = typeof MOVIE_FORMAT_QUALITY_LABEL[number];
export type FormatQualitySlug = typeof MOVIE_FORMAT_QUALITY_SLUG[number];

export const SOUND_FORMAT_LABEL = models['SOUND_FORMAT'].map(key => key.label);
export const SOUND_FORMAT_SLUG = models['SOUND_FORMAT'].map(key => key.slug);

export type SoundFormatLabel = typeof SOUND_FORMAT_LABEL[number];
export type SoundFormatSlug = typeof SOUND_FORMAT_SLUG[number];
