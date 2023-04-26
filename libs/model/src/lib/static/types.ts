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
  accessibility,
  screeningStatus,
  memberStatus,
  directorCategory,
  importContractStatus,
  offerStatus,
  negotiationStatus,
  app,
  modules,
  appName,
  eventTypes,
  privacies,
  emailErrorCode,
  festival,
  movieNoteRoles,
  releaseMedias,
  screenerTypes,
  TerritoryGroup,
  territoriesISOA2
} from './static-model';

export type App = typeof app[number];
export type AppNameValue = typeof appName[App];

export type Module = typeof modules[number];
export type ModuleAccess = Record<Module, boolean>;

export type OrgAppAccess = Record<App, ModuleAccess>;

export type AlgoliaApp = Exclude<App, 'crm'>;

export type Privacy = typeof privacies[number];

export type ScreenerType = typeof screenerTypes[number];

export type NumberRange = keyof typeof budgetRange;

export type Certification = keyof typeof certifications;
export type CertificationValue = typeof certifications[Certification];

export type Color = keyof typeof colors;

export type ContentType = keyof typeof contentType;

export type ContractStatus = keyof typeof contractStatus;

export type ImportContractStatus = typeof importContractStatus[number];

export type OfferStatus = keyof typeof offerStatus;

export type NegotiationStatus = typeof negotiationStatus[number];

export type ContractType = keyof typeof contractType;

export type CrewRole = keyof typeof crewRoles;
export type CrewRoleValue = typeof crewRoles[CrewRole];

export type Festival = keyof typeof festival;

export type Genre = keyof typeof genres;
export type GenresValue = keyof typeof genres[Genre] & string;

export type HostedVideoType = keyof typeof hostedVideoTypes;

export type InvitationType = keyof typeof invitationType;

export type Language = keyof typeof languages;

export type Media = keyof typeof medias;

export type ReleaseMedia = keyof typeof releaseMedias;
export type ReleaseMediaValue = typeof releaseMedias[ReleaseMedia];

export type MovieCurrency = keyof typeof movieCurrencies;

export type MovieFormat = keyof typeof movieFormat;

export type MovieFormatQuality = keyof typeof movieFormatQuality;

export type MovieLanguageType = keyof typeof movieLanguageTypes;
export type MovieLanguageTypeValue = typeof movieLanguageTypes[MovieLanguageType];

export type OrgActivity = keyof typeof orgActivity;

export type OrganizationStatus = keyof typeof organizationStatus;

export type InvitationStatus = keyof typeof invitationStatus;

export type AnonymousRole = 'guest' | 'organizer';

export type PremiereType = keyof typeof premiereType;

export type ProducerRole = keyof typeof producerRoles;
export type ProducerRoleValue = typeof producerRoles[ProducerRole];

export type ProductionStatus = keyof typeof productionStatus;
export type ProductionStatusValue = typeof productionStatus[ProductionStatus];

export type EventTypes = keyof typeof eventTypes;
export type EventTypesValue = typeof eventTypes[EventTypes];

export type Rating = keyof typeof rating;

export type Scoring = keyof typeof scoring;

export type ShootingPeriod = keyof typeof shootingPeriod;

export type ScreeningStatus = keyof typeof screeningStatus;

export type MemberStatus = keyof typeof memberStatus;

export type DirectorCategory = keyof typeof directorCategory;

export type SocialGoal = keyof typeof socialGoals;

export type SoundFormat = keyof typeof soundFormat;

export type StakeholderRole = keyof typeof stakeholderRoles;
export type StakeholderRoleValue = keyof typeof stakeholderRoles[StakeholderRole] & string;

export type MovieNoteRole = keyof typeof movieNoteRoles;

export type StoreStatus = keyof typeof storeStatus;

export type UnitBox = keyof typeof unitBox;

export type Territory = keyof typeof territories;
export type TerritoryValue = typeof territories[Territory];
export type TerritoryISOA2 = keyof typeof territoriesISOA2;
export type TerritoryISOA2Value = typeof territoriesISOA2[TerritoryISOA2];
export type TerritoryISOA3 = keyof typeof territoriesISOA3;
export type TerritoryISOA3Value = typeof territoriesISOA3[TerritoryISOA3];
export type encodedTerritory = Territory | TerritoryISOA2Value | TerritoryGroup;

export type AccessibilityTypes = keyof typeof accessibility;
export type AccessibilityTypesValue = typeof accessibility[AccessibilityTypes];

export type EmailErrorCode = typeof emailErrorCode[number];

export type RequestStatus = 'available' | 'sending' | 'sent';
