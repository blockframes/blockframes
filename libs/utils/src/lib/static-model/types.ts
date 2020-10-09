import models from './staticModels';
import constants from './staticConsts';

// TYPE FOR MODELS

export const LANGUAGES_LABEL = models['LANGUAGES'].map(key => key.label);
export const LANGUAGES_SLUG = models['LANGUAGES'].map(key => key.slug);
export type LanguagesLabel = typeof LANGUAGES_LABEL[number];
export type LanguagesSlug = typeof LANGUAGES_SLUG[number];

export const TERRITORIES_LABEL = models['TERRITORIES'].map(key => key.label);
export const TERRITORIES_SLUG = models['TERRITORIES'].map(key => key.slug);
export type TerritoriesLabel = typeof TERRITORIES_LABEL[number];
export type TerritoriesSlug = typeof TERRITORIES_SLUG[number];

export const RESOURCE_SIZES_SLUG = models['RESOURCE_SIZES'].map(key => key.slug);
export type ResourceSizesSlug = typeof RESOURCE_SIZES_SLUG[number];

export const RESOURCE_RATIOS_SLUG = models['RESOURCE_RATIOS'].map(key => key.slug);
export type ResourceRatioSlug = typeof RESOURCE_RATIOS_SLUG[number];

// TYPE FOR CONSTANTS

export type CartStatus = keyof typeof constants.cartStatus;

export type Certifications = keyof typeof constants.certifications;
export type CertificationsValues = typeof constants.certifications[Certifications];

export type Colors = keyof typeof constants.colors;

export type ContentType = keyof typeof constants.contentType;

export type ContractStatus = keyof typeof constants.contractStatus;

export type ContractType = keyof typeof constants.contractType;

export type CrewRoles = keyof typeof constants.crewRoles;
export type CrewRolesValues = typeof constants.crewRoles[CrewRoles];

export type DistributionRightStatus = keyof typeof constants.distributionRightStatus;

export type Genres = keyof typeof constants.genres;

export type HostedVideoTypes = keyof typeof constants.hostedVideoTypes;

export type LegalRoles = keyof typeof constants.legalRoles;

export type Medias = keyof typeof constants.medias;
export type MediasValues = typeof constants.medias[Medias];

export type MovieCurrencies = keyof typeof constants.movieCurrencies;

export type MovieFormat = keyof typeof constants.movieFormat;

export type MovieFormatQuality = keyof typeof constants.movieFormatQuality;

export type MovieLanguageTypes = keyof typeof constants.movieLanguageTypes;
export type MovieLanguageTypesValue = typeof constants.movieLanguageTypes[MovieLanguageTypes];

export type OrgActivity = keyof typeof constants.orgActivity | '';
export type OrganizationStatus = keyof typeof constants.organizationStatus;

export type PremiereType = keyof typeof constants.premiereType;

export type ProducerRoles = keyof typeof constants.producerRoles;
export type ProducerRolesValues = typeof constants.producerRoles[ProducerRoles];

export type ProductionStatus = keyof typeof constants.productionStatus;

export type Rating = keyof typeof constants.rating;

export type Scoring = keyof typeof constants.scoring;

export type ShootingPeriod = keyof typeof constants.shootingPeriod;

export type SocialGoals = keyof typeof constants.socialGoals;

export type SoundFormat = keyof typeof constants.soundFormat;

export type StoreStatus = keyof typeof constants.storeStatus;

export type StoreType = keyof typeof constants.storeType;
export type StoreTypeValue = typeof constants.storeType[StoreType];

export type SubLicensorRoles = keyof typeof constants.subLicensorRoles;

export type UnitBox = keyof typeof constants.unitBox;
export type UnitBoxValue = typeof constants.unitBox[UnitBox];
