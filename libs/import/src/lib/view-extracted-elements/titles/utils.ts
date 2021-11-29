
import { App } from '@blockframes/utils/apps';
import { UserService } from '@blockframes/user/+state';
import { mandatoryError, MovieImportState, WrongValueError, optionalWarning, getDate, adminOnlyWarning, getUser, UnknownEntityError } from '@blockframes/import/utils';
import { createMovie } from '@blockframes/movie/+state';
import { extract, ExtractConfig, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { MovieAppConfig, MovieGoalsAudience, MovieLanguageSpecification, MovieRelease, MovieRunningTime, MovieStakeholders } from '@blockframes/movie/+state/movie.firestore';
import { Certification, Color, ContentType, CrewRole, Genre, Language, MediaValue, MovieFormat, MovieFormatQuality, NumberRange, PremiereType, ProducerRole, ProductionStatus, SocialGoal, SoundFormat, StakeholderRole, StoreStatus, Territory } from '@blockframes/utils/static-model';
import { User } from '@blockframes/auth/+state';
import { Stakeholder } from '@blockframes/utils/common-interfaces';

interface FieldsConfig {
  title: {
    international: string;
    original: string;
    series: number;
  };
  internalRef: string;
  contentType: ContentType;
  productionStatus: ProductionStatus;
  release: MovieRelease;
  directors: {
    firstName: string;
    lastName: string;
    description: string;
  }[];
  originCountries: Territory[];
  stakeholders: {
    displayName: string;
    role: StakeholderRole;
    countries: Territory[];
  }[];
  originalRelease: {
    country: Territory;
    media: MediaValue;
    date: Date;
  }[];
  originalLanguages: Language[];
  genres: Genre[];
  customGenres: string[];
  runningTime: MovieRunningTime;
  cast: {
    firstName: string;
    lastName: string;
    status: string;
  }[];
  prizes: {
    name: string;
    year: number;
    prize: string;
    premiere: PremiereType;
  }[];
  logline: string;
  synopsis: string;
  keyAssets: string;
  keywords: string[];
  producers: {
    firstName: string;
    lastName: string;
    role: ProducerRole;
  }[];
  crew: {
    firstName: string;
    lastName: string;
    role: CrewRole;
  }[];
  budgetRange: NumberRange;
  boxoffice: {
    territory: string;
    unit: string;
    value: number;
  }[];
  certifications: Certification[];
  ratings: {
    country: string;
    value: string;
  }[];
  audience: MovieGoalsAudience;
  reviews: {
    filmCriticName: string;
    revue: string;
    link: string;
    quote: string;
  }[];
  color: Color;
  format: MovieFormat;
  formatQuality: MovieFormatQuality;
  soundFormat: SoundFormat;
  isOriginalVersionAvailable: boolean;
  languages: {
    language: string;
    dubbed: boolean;
    subtitle: boolean;
    caption: boolean;
  }[];
  salesPitch: string;
  app: Partial<{ [app in App]: MovieAppConfig<Date> }>

  orgIds: string[];
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;



export async function formatTitle(
  sheetTab: SheetTab,
  userService: UserService,
  blockframesAdmin: boolean,
  userOrgId: string,
  currentApp: App,
) {

  const titles: MovieImportState[] = [];

  const userCache: Record<string, User> = {};

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */ 'title.international': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'title.international', name: 'International Title' }));
      return value;
    },
    /* b */ 'title.original': (value: string) => { // ! required
      if (!value) return mandatoryError({ field: 'title.original', name: 'Original Title' });
      return value;
    },
    /* c */ 'internalRef': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'internalRef', name: 'Internal Ref' }));
      return value;
    },
    /* d */ 'contentType': (value: string) => { // ! required
      if (!value) return mandatoryError({ field: 'contentType', name: 'Content Type' });
      const key = getKeyIfExists('contentType', value) as ContentType;
      if (!key) throw new WrongValueError({ field: 'contentType', name: 'Content Type' });
      return key
    },
    /* e */ 'title.series': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'title.series', name: 'Season Number' }));
      const series = Number(value);
      if (isNaN(series)) throw new WrongValueError({ field: 'title.series', name: 'Season Number' });
      return series;
    },
    /* f */ 'runningTime.episodeCount': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'runningTime.episodeCount', name: 'Number of Episodes' }));
      const count = Number(value);
      if (isNaN(count)) throw new WrongValueError({ field: 'runningTime.episodeCount', name: 'Number of Episodes' });
      return count;
    },
    /* g */ 'productionStatus': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'productionStatus', name: 'Production Status' }));
      const status = getKeyIfExists('productionStatus', value) as ProductionStatus;
      if (!status) throw new WrongValueError({ field: 'productionStatus', name: 'Production Status' });
      return status;
    },
    /* h */ 'release.year': (value: string) => { // ! required
      if (!value) return mandatoryError({ field: 'release.year', name: 'Release Year' });
      const year = Number(value);
      if (isNaN(year)) throw new WrongValueError({ field: 'release.year', name: 'Release Year' });
      return year;
    },
    /* i */ 'release.status': (value: string) => { // ! required
      if (!value) return mandatoryError({ field: 'release.status', name: 'Release Status' });
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw new WrongValueError({ field: 'release.year', name: 'Release Year' });
      return status;
    },
    /* j */ 'directors[].firstName': (value: string) => {
      if (!value) return mandatoryError({ field: 'directors[].firstName', name: 'Director\'s first name' });
      return value;
    },
    /* k */ 'directors[].lastName': (value: string) => {
      if (!value) return mandatoryError({ field: 'directors[].lastName', name: 'Director\'s last name' });
      return value;
    },
    /* l */ 'directors[].description': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'directors[].description', name: 'Director(s) Description' }));
      return value;
    },
    /* m */ 'originCountries[]': (value: string) => { // ! required
      if (!value) return mandatoryError({ field: 'originCountries', name: 'Origin Countries' });
      const territories = getKeyIfExists('territories', value) as Territory;
      if (!territories) throw new WrongValueError({ field: 'originCountries', name: 'Origin Countries' });
      return territories;
    },
    /* n */ 'stakeholders[].displayName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'stakeholders[].displayName', name: 'Stakeholders Name' }));
      return value;
    },
    /* o */ 'stakeholders[].role': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'stakeholders[].role', name: 'Stakeholders Role' }));
      const role = getKeyIfExists('stakeholderRoles', value) as StakeholderRole;
      if (!role) throw new WrongValueError({ field: 'stakeholders[].role', name: 'Stakeholders Role' });
      return role;
    },
    /* p */ 'stakeholders[].countries[]': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'stakeholders[].country', name: 'Stakeholders Country' }));
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) throw new WrongValueError({ field: 'stakeholders[].country', name: 'Stakeholders Country' });
      return country;
    },
    /* q */ 'originalRelease[].country': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'originalRelease[].country', name: 'Original release Country' }));
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) throw new WrongValueError({ field: 'originalRelease[].country', name: 'Original release Country' });
      return country;
    },
    /* r */ 'originalRelease[].media': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'originalRelease[].media', name: 'Original release Media' }));
      const media = getKeyIfExists('medias', value) as MediaValue;
      if (!media) throw new WrongValueError({ field: 'originalRelease[].media', name: 'Original release Media' });
      return media;
    },
    /* s */ 'originalRelease[].date': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'originalRelease[].date', name: 'Original release Date' }));
      return getDate(value, { field: 'originalRelease[].date', name: 'Original release Date'}) as Date;
    },
    /* t */ 'originalLanguages[]': (value: string) => { // ! required
      if (!value || !value.length) return mandatoryError({ field: 'originalLanguages', name: 'Original Languages' });
      const languages = getKeyIfExists('languages', value) as Language;
      if (!languages) throw new WrongValueError({ field: 'originalLanguages', name: 'Original Languages' });
      return languages;
    },
    /* u */ 'genres[]': (value: string) => { // ! required
      if (!value || !value.length) return mandatoryError({ field: 'genres', name: 'Genres' });
      const genres = getKeyIfExists('genres', value) as Genre;
      if (!genres) throw new WrongValueError({ field: 'genres', name: 'Genres' });
      return genres;
    },
    /* v */ 'customGenres[]': (value: string) => {
      if (!value || !value.length) return new ValueWithWarning(null, optionalWarning({ field: 'customGenres[]', name: 'Custom Genres' }));
      return value;
    },
    /* w */ 'runningTime.time': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'runningTime.time', name: 'Running Time' }));
      const time = Number(value);
      if (isNaN(time)) throw new WrongValueError({ field: 'runningTime.time', name: 'Running Time' });
      return time;
    },
    /* x */ 'runningTime.status': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'runningTime.status', name: 'Running Time Status' }));
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw new WrongValueError({ field: 'runningTime.status', name: 'Running Time Status' });
      return status;
    },
    /* y */ 'cast[].firstName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'cast[].firstName', name: 'Principal Cast First Name' }));
      return value;
    },
    /* z */ 'cast[].lastName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'cast[].lastName', name: 'Principal Cast Last Name' }));
      return value;
    },
    /* aa */ 'cast[].status': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'cast[].status', name: 'Principal Cast Status' }));
      const status = getKeyIfExists('memberStatus', value);
      if (!status) throw new WrongValueError({ field: 'cast[].status', name: 'Principal Cast Status' });
      return status;
    },
    /* ab */ 'prizes[].name': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].name', name: 'Festival Prizes Festival Name' }));
      const festival = getKeyIfExists('festival', value);
      if (!festival) throw new WrongValueError({ field: 'prizes[].name', name: 'Festival Prizes Festival Name' });
      return festival;
    },
    /* ac */ 'prizes[].year': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].year', name: 'Festival Prizes Year' }));
      const year = Number(value);
      if (isNaN(year)) throw new WrongValueError({ field: 'prizes[].year', name: 'Festival Prizes Year'});
      return year;
    },
    /* ad */ 'prizes[].prize': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].prize', name: 'Festival Prizes Selection/Prize' }));
      return value;
    },
    /* ae */ 'prizes[].premiere': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].premiere', name: 'Festival Prizes Premiere' }));
      const premiere = getKeyIfExists('premiereType', value) as PremiereType;
      if (!premiere) throw new WrongValueError({ field: 'prizes[].premiere', name: 'Festival Prizes Premiere'});
      return premiere;
    },
    /* af */ 'logline': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'logline', name: 'Logline' }));
      return value;
    },
    /* ag */ 'synopsis': (value: string) => { // ! required
      if (!value) return mandatoryError({ field: 'synopsis', name: 'Synopsis' });
      return value;
    },
    /* ah */ 'keyAssets': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'keyAssets', name: 'Key Assets' }));
      return value;
    },
    /* ai */ 'keywords[]': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'keywords[]', name: 'Keywords' }));
      return value;
    },
    /* aj */ 'producers[].firstName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'producers[].firstName', name: 'Producer(s) First Name' }));
      return value;
    },
    /* ak */ 'producers[].lastName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'producers[].lastName', name: 'Producer(s) Last Name' }));
      return value;
    },
    /* al */ 'producers[].role': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'producers[].role', name: 'Producer(s) Role' }));
      const role = getKeyIfExists('producerRoles', value) as ProducerRole;
      if (!role) throw new WrongValueError({ field: 'producers[].role', name: 'Producer(s) Role' });
      return role;
    },
    /* am */ 'crew[].firstName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'crew[].firstName', name: 'Crew Member(s) First Name' }));
      return value;
    },
    /* an */ 'crew[].lastName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'crew[].lastName', name: 'Crew Member(s) Last Name' }));
      return value;
    },
    /* ao */ 'crew[].role': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'crew[].role', name: 'Crew Member(s) Role' }));
      const role = getKeyIfExists('crewRoles', value) as CrewRole;
      if (!role) throw new WrongValueError({ field: 'crew[].role', name: 'Crew Member(s) Role' });
      return role;
    },
    /* ap */ 'budgetRange': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'budgetRange', name: 'Budget Range' }));
      const budget = getKeyIfExists('budgetRange', value);
      if (!budget) throw new WrongValueError({ field: 'budgetRange', name: 'Budget Range' });
      return budget as any;
    },
    /* aq */ 'boxoffice[].territory': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'boxoffice[].territory', name: 'Box Office Country' }));
      const country = getKeyIfExists('territories', value);
      if (!country) throw new WrongValueError({ field: 'boxoffice[].territory', name: 'Box Office Country' });
      return country;
    },
    /* ar */ 'boxoffice[].unit': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'boxoffice[].unit', name: 'Box Office Metric' }));
      const unit = getKeyIfExists('unitBox', value);
      if (!unit) throw new WrongValueError({ field: 'boxoffice[].unit', name: 'Box Office Metric' });
      return unit;
    },
    /* as */ 'boxoffice[].value': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'boxoffice[].value', name: 'Box Office Number' }));
      const num = Number(value);
      if (!num) throw new WrongValueError({ field: 'boxoffice[].value', name: 'Box Office Number' });
      return num;
    },
    /* at */ 'certifications[]': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'certifications[]', name: 'Certification' }));
      const certification = getKeyIfExists('certifications', value) as Certification;
      if (!certification) throw new WrongValueError({ field: 'certifications[', name: 'Certification' });
      return certification;
    },
    /* au */ 'ratings[].country': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'ratings[].country', name: 'Ratings Country' }));
      const country = getKeyIfExists('territories', value);
      if (!country) throw new WrongValueError({ field: 'ratings[].country', name: 'Ratings Country' });
      return country;
    },
    /* av */ 'ratings[].value': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'ratings[].value', name: 'Ratings Value' }));
      return value;
    },
    /* aw */ 'audience.targets[]': (value: string) => {
      if (!value) return new ValueWithWarning(undefined, optionalWarning({ field: 'audience[].targets', name: 'Target Audience' }));
      return value;
    },
    /* ax */ 'audience.goals[]': (value: string) => {
      if (!value) return new ValueWithWarning(undefined, optionalWarning({ field: 'audience[].goals[]', name: 'Social Responsibility Goals' }));
      const valid = getKeyIfExists('socialGoals', value);
      if (!valid) throw new WrongValueError({ field: 'audience[].goals[]', name: 'Social Responsibility Goals' });
      return value as SocialGoal;
    },
    /* ay */ 'reviews[].filmCriticName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'reviews[].filmCriticName', name: 'Film Reviews Critic Name' }));
      return value;
    },
    /* az */ 'reviews[].revue': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'reviews[].revue', name: 'Film Reviews Revue or Journal' }));
      return value;
    },
    /* ba */ 'reviews[].link': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'reviews[].link', name: 'Film Reviews Link' }));
      return value;
    },
    /* bb */ 'reviews[].quote': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'reviews[].quote', name: 'Film Reviews Quote' }));
      return value;
    },
    /* bc */ 'color': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'color', name: 'Color / Black & White' }));
      const color = getKeyIfExists('colors', value) as Color;
      if (!color) throw new WrongValueError({ field: 'color', name: 'Color / Black & White '});
      return color;
    },
    /* bd */ 'format': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'format', name: 'Shooting Format' }));
      const format = getKeyIfExists('movieFormat', value) as MovieFormat;
      if (!format) throw new WrongValueError({ field: 'format', name: 'Shooting Format' });
      return format;
    },
    /* be */ 'formatQuality': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'formatQuality', name: 'Available Format Quality' }));
      const quality = getKeyIfExists('movieFormatQuality', value) as MovieFormatQuality;
      if (!quality) throw new WrongValueError({ field: 'formatQuality', name: 'Available Format Quality' });
      return quality;
    },
    /* bf */ 'soundFormat': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'soundFormat', name: 'Sound Format' }));
      const sound = getKeyIfExists('soundFormat', value) as SoundFormat;
      if (!sound) throw new WrongValueError({ field: 'soundFormat', name: 'Sound Format' });
      return sound;
    },
    /* bg */ 'isOriginalVersionAvailable': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'isOriginalVersionAvailable', name: 'Original Version Authorized' }));
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw new WrongValueError({ field: 'isOriginalVersionAvailable', name: 'Original Version Authorized' });
      return lower === 'yes';
    },
    /* bh */ 'languages[].language': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].language', name: 'Available Version(s) Language' }));
      const language = getKeyIfExists('languages', value);
      if (!language) throw new WrongValueError({ field: 'languages[].language', name: 'Available Version(s) Language' });
      return language;
    },
    /* bi */ 'languages[].dubbed': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].dubbed', name: 'Available Version(s) Dubbed' }));
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw new WrongValueError({ field: 'languages[].dubbed', name: 'Available Version(s) Dubbed' });
      return lower === 'yes';
    },
    /* bj */ 'languages[].subtitle': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].subtitle', name: 'Available Version(s) Subtitle' }));
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw new WrongValueError({ field: 'languages[].subtitle', name: 'Available Version(s) Subtitle' });
      return lower === 'yes';
    },
    /* bk */ 'languages[].caption': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].caption', name: 'Available Version(s) Caption' }));
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw new WrongValueError({ field: 'languages[].caption', name: 'Available Version(s) Caption' });
      return lower === 'yes';
    },
    /* bl */ 'salesPitch': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'salesPitch', name: 'Sales Pitch' }));
      return value;
    },

    // ! ADMIN
    /* bm */ 'app.catalog': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = { status: 'draft', access: 'catalog' === currentApp, acceptedAt: null, refusedAt: null };

      if (!value && blockframesAdmin) return new ValueWithWarning(defaultAccess, optionalWarning({ field: 'catalogStatus', name: 'Catalog Status' }));
      if (value && !blockframesAdmin) return new ValueWithWarning(defaultAccess, adminOnlyWarning({ field: 'catalogStatus', name: 'Catalog Status' }));
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) throw new WrongValueError({ field: 'catalogStatus', name: 'Catalog Status' });

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bn */ 'app.festival': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = { status: 'draft', access: 'festival' === currentApp, acceptedAt: null, refusedAt: null };

      if (!value && blockframesAdmin) return new ValueWithWarning(defaultAccess, optionalWarning({ field: 'festivalStatus', name: 'Festival Status' }));
      if (value && !blockframesAdmin) return new ValueWithWarning(defaultAccess, adminOnlyWarning({ field: 'festivalStatus', name: 'Festival Status' }));
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) throw new WrongValueError({ field: 'festivalStatus', name: 'Festival Status' });

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bo */ 'app.financiers': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = { status: 'draft', access: 'financiers' === currentApp, acceptedAt: null, refusedAt: null };

      if (!value && blockframesAdmin) return new ValueWithWarning(defaultAccess, optionalWarning({ field: 'financiersStatus', name: 'Financiers Status' }));
      if (value && !blockframesAdmin) return new ValueWithWarning(defaultAccess, adminOnlyWarning({ field: 'financiersStatus', name: 'Financiers Status' }));
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) throw new WrongValueError({ field: 'financiersStatus', name: 'Financiers Status' });

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bp */ 'orgIds': async (value: string) => { // ! required
      if (!value && blockframesAdmin) return mandatoryError({ field: 'orgIds', name: 'Owner Id' });
      if (value && !blockframesAdmin) return new ValueWithWarning([userOrgId], adminOnlyWarning({ field: 'orgIds', name: 'Owner Id' }));
      if (!value) return [userOrgId];
      const user = await getUser({ id: value }, userService, userCache);
      if (!user) throw new UnknownEntityError({ field: 'orgIds', name: 'Owner Id' });
      return [user.orgId];
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 10);

  for (const result of results) {
    const { data, errors } = result;

    if (!data.stakeholders) {
      errors.push(optionalWarning({ field: 'stakeholders', name: 'Stakeholders' }));
    }

    const getStakeholders = (role: StakeholderRole): Stakeholder[] => data.stakeholders?.filter(s => s.role === role) ?? [];

    const stakeholders: MovieStakeholders = {
      productionCompany: getStakeholders('executiveProducer'),
      coProductionCompany:  getStakeholders('coProducer'),
      broadcasterCoproducer:  getStakeholders('broadcasterCoproducer'),
      lineProducer:  getStakeholders('lineProducer'),
      distributor:  getStakeholders('distributor'),
      salesAgent:  getStakeholders('salesAgent'),
      laboratory:  getStakeholders('laboratory'),
      financier:  getStakeholders('financier'),
    };

    const languages: Partial<{ [language in Language]: MovieLanguageSpecification }> = {};
    if (!data.languages) {
      errors.push(optionalWarning({ field: 'languages', name: 'Languages' }));
    } else {
      for (const { language, dubbed, subtitle, caption } of data.languages) {
        languages[language] = { dubbed, subtitle, caption };
      }
    }

    const title = createMovie({ ...data, languages, stakeholders });

    if (!title.directors || !title.directors.length) errors.push({
      type: 'error',
      field: 'directors',
      name: 'Missing Director(s)',
      reason: 'You need to fill at least one Director',
      hint: 'Please edit the corresponding sheets field'
    });

    titles.push({ errors,  movie: title });
  }

  return titles;
}
