import {
  languages,
  certifications,
  colors,
  contentType,
  contractStatus,
  contractType,
  crewRoles,
  genres,
  hostedVideoTypes,
  invitationType,
  invitationStatus,
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
  unitBox,
  territories,
  territoriesISOA3,
  budgetRange,
  accessibility
} from './static-model';

export type NumberRange = keyof typeof budgetRange;

export type Certification = keyof typeof certifications;
export type CertificationValue = typeof certifications[Certification];

export type Color = keyof typeof colors;

export type ContentType = keyof typeof contentType;

export type ContractStatus = keyof typeof contractStatus;

export type ContractType = keyof typeof contractType;

export type CrewRole = keyof typeof crewRoles;
export type CrewRoleValue = typeof crewRoles[CrewRole];

export type Genre = keyof typeof genres;
export type GenresValue = keyof typeof genres[Genre] & string;

export type HostedVideoType = keyof typeof hostedVideoTypes;

export type InvitationType = keyof typeof invitationType;

export type Language = keyof typeof languages;
export type LanguageValue = typeof languages[Language];

export type Media = keyof typeof medias;
export type MediaValue = typeof medias[Media];

export type MovieCurrency = keyof typeof movieCurrencies;

export type MovieFormat = keyof typeof movieFormat;

export type MovieFormatQuality = keyof typeof movieFormatQuality;

export type MovieLanguageType = keyof typeof movieLanguageTypes;
export type MovieLanguageTypeValue = typeof movieLanguageTypes[MovieLanguageType];

export type OrgActivity = keyof typeof orgActivity;

export type OrganizationStatus = keyof typeof organizationStatus;

export type InvitationStatus = keyof typeof invitationStatus;

export type PremiereType = keyof typeof premiereType;

export type ProducerRole = keyof typeof producerRoles;
export type ProducerRoleValue = typeof producerRoles[ProducerRole];

export type ProductionStatus = keyof typeof productionStatus;

export type Rating = keyof typeof rating;

export type Scoring = keyof typeof scoring;

export type ShootingPeriod = keyof typeof shootingPeriod;

export type SocialGoal = keyof typeof socialGoals;

export type SoundFormat = keyof typeof soundFormat;

export type StakeholderRole = keyof typeof stakeholderRoles;
export type StakeholderRoleValue = keyof typeof stakeholderRoles[StakeholderRole] & string;

export type StoreStatus = keyof typeof storeStatus;

export type UnitBox = keyof typeof unitBox;

export type Territory = keyof typeof territories;
export type TerritoryValue = typeof territories[Territory];
export type TerritoryISOA3 = keyof typeof territoriesISOA3;
export type TerritoryISOA3Value = typeof territoriesISOA3[TerritoryISOA3];

export type AccessibilityTypes = keyof typeof accessibility;
export type AccessibilityTypesValue = typeof accessibility[AccessibilityTypes];
