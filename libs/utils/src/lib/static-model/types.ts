import {
  cartStatus,
  languages,
  certifications,
  colors,
  contentType,
  contractStatus,
  contractType,
  crewRoles,
  distributionRightStatus,
  genres,
  hostedVideoTypes,
  legalRoles,
  medias,
  movieCurrencies,
  movieFormat,
  movieFormatQuality,
  movieLanguageTypes,
  orgActivity,
  organizationStatus,
  premiereType,
  producerRoles,
  productionStatus,
  rating,
  scoring,
  shootingPeriod,
  socialGoals,
  soundFormat,
  stakeholderRoles,
  storeStatus,
  storeType,
  subLicensorRoles,
  unitBox,
  territories, territoriesISOA3, territoriesISOA2, territoriesNUMCODE, territoriesFR
} from './staticConsts';

// TYPE FOR CONSTANTS

export type CartStatus = keyof typeof cartStatus;

export type Certifications = keyof typeof certifications;
export type CertificationsValues = typeof certifications[Certifications];

export type Colors = keyof typeof colors;

export type ContentType = keyof typeof contentType;

export type ContractStatus = keyof typeof contractStatus;

export type ContractType = keyof typeof contractType;

export type CrewRoles = keyof typeof crewRoles;
export type CrewRolesValues = typeof crewRoles[CrewRoles];

export type DistributionRightStatus = keyof typeof distributionRightStatus;

export type Genres = keyof typeof genres;

export type HostedVideoTypes = keyof typeof hostedVideoTypes;

export type Languages = keyof typeof languages & string;

export type LegalRoles = keyof typeof legalRoles;

export type Medias = keyof typeof medias;
export type MediasValues = typeof medias[Medias];

export type MovieCurrencies = keyof typeof movieCurrencies;

export type MovieFormat = keyof typeof movieFormat;

export type MovieFormatQuality = keyof typeof movieFormatQuality;

export type MovieLanguageTypes = keyof typeof movieLanguageTypes;
export type MovieLanguageTypesValue = typeof movieLanguageTypes[MovieLanguageTypes];

export type OrgActivity = keyof typeof orgActivity;
export type OrganizationStatus = keyof typeof organizationStatus;

export type PremiereType = keyof typeof premiereType;

export type ProducerRoles = keyof typeof producerRoles;
export type ProducerRolesValues = typeof producerRoles[ProducerRoles];

export type ProductionStatus = keyof typeof productionStatus;

export type Rating = keyof typeof rating;

export type Scoring = keyof typeof scoring;

export type ShootingPeriod = keyof typeof shootingPeriod;

export type SocialGoals = keyof typeof socialGoals;

export type SoundFormat = keyof typeof soundFormat;

export type StakeholderRoles = keyof typeof stakeholderRoles;

export type StoreStatus = keyof typeof storeStatus;

export type StoreType = keyof typeof storeType;
export type StoreTypeValue = typeof storeType[StoreType];

export type SubLicensorRoles = keyof typeof subLicensorRoles;

export type UnitBox = keyof typeof unitBox;
export type UnitBoxValue = typeof unitBox[UnitBox];

export type Territories = keyof typeof territories;
export type TerritoriesValues = typeof territories[Territories];
export type TerritoriesISOA2 = keyof typeof territoriesISOA2;
export type TerritoriesISOA2Values = typeof territoriesISOA2[TerritoriesISOA2];
export type TerritoriesISOA3 = keyof typeof territoriesISOA3;
export type TerritoriesISOA3Values = typeof territoriesISOA3[TerritoriesISOA3];
export type TerritoriesNUMCODE = keyof typeof territoriesNUMCODE;
export type TerritoriesNUMCODEValues = typeof territoriesNUMCODE[TerritoriesNUMCODE];
export type TerritoriesFR = keyof typeof territoriesFR;
export type TerritoriesFRValues = typeof territoriesFR[TerritoriesFR];