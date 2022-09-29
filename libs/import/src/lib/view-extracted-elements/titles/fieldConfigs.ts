import { UserService } from '@blockframes/user/service';
import {
  mandatoryError,
  wrongValueError,
  optionalWarning,
  getDate,
  getUser,
  unknownEntityError,
  wrongTemplateError,
} from '@blockframes/import/utils';
import { ExtractConfig } from '@blockframes/utils/spreadsheet';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import {
  MovieAppConfig,
  Certification,
  Color,
  ContentType,
  CrewRole,
  Genre,
  Language,
  ReleaseMedia,
  MemberStatus,
  MovieFormat,
  MovieFormatQuality,
  PremiereType,
  ProducerRole,
  ProductionStatus,
  SoundFormat,
  StakeholderRole,
  Territory,
  App,
  User,
  MovieRelease,
  MovieRunningTime,
  NumberRange,
  MovieGoalsAudience,
  BoxOffice,
  MovieRating,
  MovieReview
} from '@blockframes/model';

export interface FieldsConfig {
  id: string;
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
    media: ReleaseMedia;
    date: Date;
  }[];
  originalLanguages: Language[];
  genres: Genre[];
  customGenres: string[];
  runningTime: MovieRunningTime;
  cast: {
    firstName: string;
    lastName: string;
    status: MemberStatus;
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
  estimatedBudget: NumberRange;
  boxOffice: BoxOffice[];
  certifications: Certification[];
  rating: MovieRating[];
  audience: MovieGoalsAudience;
  review: MovieReview[];
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
  app: Partial<{ [app in App]: MovieAppConfig }>;
  orgIds: string[];
}

export type FieldsConfigType = ExtractConfig<FieldsConfig>;


export function getFieldConfigs(
  userService: UserService,
  blockframesAdmin: boolean,
  userOrgId: string,
  currentApp: App
) {

  const userCache: Record<string, User> = {};

  // ! The order of the property should be the same as excel columns
  const adminFieldsConfig: FieldsConfigType = {
      /* a */ 'title.international': (value: string) => {
      if (!value) throw optionalWarning('International Title');
      return value;
    },
      /* b */ 'title.original': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Original Title');
      return value;
    },
      /* c */ internalRef: (value: string) => {
      if (!value) throw optionalWarning('Internal Ref');
      return value;
    },
      /* d */ contentType: (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Content Type');
      const key = getKeyIfExists('contentType', value);
      if (!key) throw wrongValueError(value, 'Content Type');
      return key;
    },
      /* e */ 'title.series': (value: string, data: Partial<FieldsConfig>) => {
      if (!value && data.contentType === 'tv') throw optionalWarning('Season Number');
      if (!value) return null;
      const series = Number(value);
      if (isNaN(series)) throw wrongValueError(value, 'Season Number');
      return series;
    },
      /* f */ 'runningTime.episodeCount': (value: string, data: Partial<FieldsConfig>) => {
      if (!value && data.contentType === 'tv') throw optionalWarning('Number of Episodes');
      if (!value) return null;
      const count = Number(value);
      if (isNaN(count)) throw wrongValueError(value, 'Number of Episodes');
      return count;
    },
      /* g */ productionStatus: (value: string) => {
      if (!value) throw optionalWarning('Production Status');
      const status = getKeyIfExists('productionStatus', value);
      if (!status) throw wrongValueError(value, 'Production Status');
      return status;
    },
      /* h */ 'release.year': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Release Year');
      const year = Number(value);
      if (isNaN(year)) throw wrongValueError(value, 'Release Year');
      return year;
    },
      /* i */ 'release.status': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Release Status');
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw wrongValueError(value, 'Release Year');
      return status;
    },
      /* j */ 'directors[].firstName': (value: string) => {
      if (!value) throw mandatoryError(value, "Director's first name");
      return value;
    },
      /* k */ 'directors[].lastName': (value: string) => {
      if (!value) throw mandatoryError(value, "Director's last name");
      return value;
    },
      /* l */ 'directors[].description': (value: string) => {
      if (!value) throw optionalWarning('Director(s) Description');
      return value;
    },
      /* m */ 'originCountries[]': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Origin Countries');
      const territories = getKeyIfExists('territories', value);
      if (!territories) throw wrongValueError(value, 'Origin Countries');
      return territories;
    },
      /* n */ 'stakeholders[].displayName': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Name');
      return value;
    },
      /* o */ 'stakeholders[].role': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Role');
      const role = getKeyIfExists('stakeholderRoles', value);
      if (!role) throw wrongValueError(value, 'Stakeholders Role');
      return role;
    },
      /* p */ 'stakeholders[].countries[]': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Stakeholders Country');
      return country;
    },
      /* q */ 'originalRelease[].country': (value: string) => {
      if (!value) throw optionalWarning('Original release Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Original release Country');
      return country;
    },
      /* r */ 'originalRelease[].media': (value: string) => {
      if (!value) throw optionalWarning('Original release Media');
      const media = getKeyIfExists('releaseMedias', value);
      if (!media) throw wrongValueError(value, 'Original release Media');
      return media;
    },
      /* s */ 'originalRelease[].date': (value: string) => {
      if (!value) throw optionalWarning('Original release Date');
      return getDate(value, 'Original release Date') as Date;
    },
      /* t */ 'originalLanguages[]': (value: string) => {
      // ! required
      if (!value?.length) throw mandatoryError(value, 'Original Languages');
      const language = getKeyIfExists('languages', value);
      if (!language) throw wrongValueError(value, 'Original Languages');
      return language;
    },
      /* u */ 'genres[]': (value: string) => {
      // ! required
      if (!value?.length) throw mandatoryError(value, 'Genres');
      const genre = getKeyIfExists('genres', value);
      if (!genre) throw wrongValueError(value, 'Genres');
      return genre;
    },
      /* v */ 'customGenres[]': (value: string) => {
      if (!value?.length) throw optionalWarning('Custom Genres');
      return value;
    },
      /* w */ 'runningTime.time': (value: string) => {
      if (!value) throw optionalWarning('Running Time');
      const time = Number(value);
      if (isNaN(time)) throw wrongValueError(value, 'Running Time');
      return time;
    },
      /* x */ 'runningTime.status': (value: string) => {
      if (!value) throw optionalWarning('Running Time Status');
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw wrongValueError(value, 'Running Time Status');
      return status;
    },
      /* y */ 'cast[].firstName': (value: string) => {
      if (!value) throw optionalWarning('Principal Cast First Name');
      return value;
    },
      /* z */ 'cast[].lastName': (value: string) => {
      if (!value) throw optionalWarning('Principal Cast Last Name');
      return value;
    },
      /* aa */ 'cast[].status': (value: string) => {
      if (!value) throw optionalWarning('Principal Cast Status');
      const status = getKeyIfExists('memberStatus', value);
      if (!status) throw wrongValueError(value, 'Principal Cast Status');
      return status;
    },
      /* ab */ 'prizes[].name': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Festival Name');
      const festival = getKeyIfExists('festival', value);
      if (!festival) throw wrongValueError(value, 'Festival Prizes Festival Name');
      return festival;
    },
      /* ac */ 'prizes[].year': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Year');
      const year = Number(value);
      if (isNaN(year)) throw wrongValueError(value, 'Festival Prizes Year');
      return year;
    },
      /* ad */ 'prizes[].prize': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Selection/Prize');
      return value;
    },
      /* ae */ 'prizes[].premiere': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Premiere');
      const premiere = getKeyIfExists('premiereType', value);
      if (!premiere) throw wrongValueError(value, 'Festival Prizes Premiere');
      return premiere;
    },
      /* af */ logline: (value: string) => {
      if (!value) throw optionalWarning('Logline');
      return value;
    },
      /* ag */ synopsis: (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Synopsis');
      return value;
    },
      /* ah */ keyAssets: (value: string) => {
      if (!value) throw optionalWarning('Key Assets');
      return value;
    },
      /* ai */ 'keywords[]': (value: string) => {
      if (!value) throw optionalWarning('Keywords');
      return value;
    },
      /* aj */ 'producers[].firstName': (value: string) => {
      if (!value) throw optionalWarning('Producer(s) First Name');
      return value;
    },
      /* ak */ 'producers[].lastName': (value: string) => {
      if (!value) throw optionalWarning('Producer(s) Last Name');
      return value;
    },
      /* al */ 'producers[].role': (value: string) => {
      if (!value) throw optionalWarning('Producer(s) Role');
      const role = getKeyIfExists('producerRoles', value);
      if (!role) throw wrongValueError(value, 'Producer(s) Role');
      return role;
    },
      /* am */ 'crew[].firstName': (value: string) => {
      if (!value) throw optionalWarning('Crew Member(s) First Name');
      return value;
    },
      /* an */ 'crew[].lastName': (value: string) => {
      if (!value) throw optionalWarning('Crew Member(s) Last Name');
      return value;
    },
      /* ao */ 'crew[].role': (value: string) => {
      if (!value) throw optionalWarning('Crew Member(s) Role');
      const role = getKeyIfExists('crewRoles', value);
      if (!role) throw wrongValueError(value, 'Crew Member(s) Role');
      return role;
    },
      /* ap */ estimatedBudget: (value: string) => {
      if (!value) throw optionalWarning('Budget Range');
      const budget = getKeyIfExists('budgetRange', value);
      if (!budget) throw wrongValueError(value, 'Budget Range');
      return budget;
    },
      /* aq */ 'boxOffice[].territory': (value: string) => {
      if (!value) throw optionalWarning('Box Office Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Box Office Country');
      return country;
    },
      /* ar */ 'boxOffice[].unit': (value: string) => {
      if (!value) throw optionalWarning('Box Office Metric');
      const unit = getKeyIfExists('unitBox', value);
      if (!unit) throw wrongValueError(value, 'Box Office Metric');
      return unit;
    },
      /* as */ 'boxOffice[].value': (value: string) => {
      if (!value) throw optionalWarning('Box Office Number');
      const num = Number(value);
      if (!num) throw wrongValueError(value, 'Box Office Number');
      return num;
    },
      /* at */ 'certifications[]': (value: string) => {
      if (!value) throw optionalWarning('Certification');
      const certification = getKeyIfExists('certifications', value);
      if (!certification) throw wrongValueError(value, 'Certification');
      return certification;
    },
      /* au */ 'rating[].country': (value: string) => {
      if (!value) throw optionalWarning('Ratings Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Ratings Country');
      return country;
    },
      /* av */ 'rating[].value': (value: string) => {
      if (!value) throw optionalWarning('Ratings Value');
      return value;
    },
      /* aw */ 'audience.targets[]': (value: string) => {
      if (!value) throw optionalWarning('Target Audience');
      return value;
    },
      /* ax */ 'audience.goals[]': (value: string) => {
      if (!value) throw optionalWarning('Social Responsibility Goals');
      const valid = getKeyIfExists('socialGoals', value);
      if (!valid) throw wrongValueError(value, 'Social Responsibility Goals');
      return valid;
    },
      /* ay */ 'review[].criticName': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Critic Name');
      return value;
    },
      /* az */ 'review[].journalName': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Revue or Journal');
      return value;
    },
      /* ba */ 'review[].revueLink': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Link');
      return value;
    },
      /* bb */ 'review[].criticQuote': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Quote');
      return value;
    },
      /* bc */ color: (value: string) => {
      if (!value) throw optionalWarning('Color / Black & White');
      const color = getKeyIfExists('colors', value);
      if (!color) throw wrongValueError(value, 'Color / Black & White');
      return color;
    },
      /* bd */ format: (value: string) => {
      if (!value) throw optionalWarning('Shooting Format');
      const format = getKeyIfExists('movieFormat', value);
      if (!format) throw wrongValueError(value, 'Shooting Format');
      return format;
    },
      /* be */ formatQuality: (value: string) => {
      if (!value) throw optionalWarning('Available Format Quality');
      const quality = getKeyIfExists('movieFormatQuality', value);
      if (!quality) throw wrongValueError(value, 'Available Format Quality');
      return quality;
    },
      /* bf */ soundFormat: (value: string) => {
      if (!value) throw optionalWarning('Sound Format');
      const sound = getKeyIfExists('soundFormat', value);
      if (!sound) throw wrongValueError(value, 'Sound Format');
      return sound;
    },
      /* bg */ isOriginalVersionAvailable: (value: string) => {
      if (!value) throw optionalWarning('Original Version Authorized');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Original Version Authorized');
      return lower === 'yes';
    },
      /* bh */ 'languages[].language': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Language');
      const language = getKeyIfExists('languages', value);
      if (!language) throw wrongValueError(value, 'Available Version(s) Language');
      return language;
    },
      /* bi */ 'languages[].dubbed': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Dubbed');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Available Version(s) Dubbed');
      return lower === 'yes';
    },
      /* bj */ 'languages[].subtitle': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Subtitle');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Available Version(s) Subtitle');
      return lower === 'yes';
    },
      /* bk */ 'languages[].caption': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Caption');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Available Version(s) Caption');
      return lower === 'yes';
    },
      /* bl */ salesPitch: (value: string) => {
      if (!value) throw optionalWarning('Sales Pitch');
      return value;
    },

      // ! ADMIN
      /* bm */ 'app.catalog': (value: string) => {
      const defaultAccess: MovieAppConfig = {
        status: 'draft',
        access: 'catalog' === currentApp,
        acceptedAt: null,
        submittedAt: null,
        refusedAt: null,
      };

      if (!value) throw optionalWarning('Catalog Status', defaultAccess);
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value);
      if (!status) throw wrongValueError(value, 'Catalog Status');

      return { status, access: true, acceptedAt: null, submittedAt: null, refusedAt: null };
    },
      /* bn */ 'app.festival': (value: string) => {
      const defaultAccess: MovieAppConfig = {
        status: 'draft',
        access: 'festival' === currentApp,
        acceptedAt: null,
        submittedAt: null,
        refusedAt: null,
      };

      if (!value) throw optionalWarning('Festival Status', defaultAccess);
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value);
      if (!status) throw wrongValueError(value, 'Festival Status');

      return { status, access: true, acceptedAt: null, submittedAt: null, refusedAt: null };
    },
      /* bo */ 'app.financiers': (value: string) => {
      const defaultAccess: MovieAppConfig = {
        status: 'draft',
        access: 'financiers' === currentApp,
        acceptedAt: null,
        submittedAt: null,
        refusedAt: null,
      };

      if (!value) throw optionalWarning('Financiers Status', defaultAccess);
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value);
      if (!status) throw wrongValueError(value, 'Financiers Status');

      return { status, access: true, acceptedAt: null, submittedAt: null, refusedAt: null };
    },
      /* bp */ orgIds: async (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Owner Id');
      if (!value) return [userOrgId];
      const user = await getUser({ id: value }, userService, userCache);
      if (!user) throw unknownEntityError(value, 'Owner Id');
      return [user.orgId];
    },
     /* bq */ id: async (value: string) => value,
  };

  // ! The order of the property should be the same as excel columns
  const sellerFieldsConfig: FieldsConfigType = {
      /* a */ 'title.international': (value: string) => {
      if (!value) throw optionalWarning('International Title');
      return value;
    },
      /* b */ 'title.original': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Original Title');
      return value;
    },
      /* c */ internalRef: (value: string) => {
      if (!value) throw optionalWarning('Internal Ref');
      return value;
    },
      /* d */ contentType: (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Content Type');
      const key = getKeyIfExists('contentType', value);
      if (!key) throw wrongValueError(value, 'Content Type');
      return key;
    },
      /* e */ 'title.series': (value: string, data: Partial<FieldsConfig>) => {
      if (!value && data.contentType === 'tv') throw optionalWarning('Season Number');
      if (!value) return null;
      const series = Number(value);
      if (isNaN(series)) throw wrongValueError(value, 'Season Number');
      return series;
    },
      /* f */ 'runningTime.episodeCount': (value: string, data: Partial<FieldsConfig>) => {
      if (!value && data.contentType === 'tv') throw optionalWarning('Number of Episodes');
      if (!value) return null;
      const count = Number(value);
      if (isNaN(count)) throw wrongValueError(value, 'Number of Episodes');
      return count;
    },
      /* g */ productionStatus: (value: string) => {
      if (!value) throw optionalWarning('Production Status');
      const status = getKeyIfExists('productionStatus', value);
      if (!status) throw wrongValueError(value, 'Production Status');
      return status;
    },
      /* h */ 'release.year': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Release Year');
      const year = Number(value);
      if (isNaN(year)) throw wrongValueError(value, 'Release Year');
      return year;
    },
      /* i */ 'release.status': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Release Status');
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw wrongValueError(value, 'Release Year');
      return status;
    },
      /* j */ 'directors[].firstName': (value: string) => {
      if (!value) throw mandatoryError(value, "Director's first name");
      return value;
    },
      /* k */ 'directors[].lastName': (value: string) => {
      if (!value) throw mandatoryError(value, "Director's last name");
      return value;
    },
      /* l */ 'directors[].description': (value: string) => {
      if (!value) throw optionalWarning('Director(s) Description');
      return value;
    },
      /* m */ 'originCountries[]': (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Origin Countries');
      const territories = getKeyIfExists('territories', value);
      if (!territories) throw wrongValueError(value, 'Origin Countries');
      return territories;
    },
      /* n */ 'stakeholders[].displayName': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Name');
      return value;
    },
      /* o */ 'stakeholders[].role': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Role');
      const role = getKeyIfExists('stakeholderRoles', value);
      if (!role) throw wrongValueError(value, 'Stakeholders Role');
      return role;
    },
      /* p */ 'stakeholders[].countries[]': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Stakeholders Country');
      return country;
    },
      /* q */ 'originalRelease[].country': (value: string) => {
      if (!value) throw optionalWarning('Original release Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Original release Country');
      return country;
    },
      /* r */ 'originalRelease[].media': (value: string) => {
      if (!value) throw optionalWarning('Original release Media');
      const media = getKeyIfExists('releaseMedias', value);
      if (!media) throw wrongValueError(value, 'Original release Media');
      return media;
    },
      /* s */ 'originalRelease[].date': (value: string) => {
      if (!value) throw optionalWarning('Original release Date');
      return getDate(value, 'Original release Date') as Date;
    },
      /* t */ 'originalLanguages[]': (value: string) => {
      // ! required
      if (!value?.length) throw mandatoryError(value, 'Original Languages');
      const language = getKeyIfExists('languages', value);
      if (!language) throw wrongValueError(value, 'Original Languages');
      return language;
    },
      /* u */ 'genres[]': (value: string) => {
      // ! required
      if (!value?.length) throw mandatoryError(value, 'Genres');
      const genre = getKeyIfExists('genres', value);
      if (!genre) throw wrongValueError(value, 'Genres');
      return genre;
    },
      /* v */ 'customGenres[]': (value: string) => {
      if (!value?.length) throw optionalWarning('Custom Genres');
      return value;
    },
      /* w */ 'runningTime.time': (value: string) => {
      if (!value) throw optionalWarning('Running Time');
      const time = Number(value);
      if (isNaN(time)) throw wrongValueError(value, 'Running Time');
      return time;
    },
      /* x */ 'runningTime.status': (value: string) => {
      if (!value) throw optionalWarning('Running Time Status');
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw wrongValueError(value, 'Running Time Status');
      return status;
    },
      /* y */ 'cast[].firstName': (value: string) => {
      if (!value) throw optionalWarning('Principal Cast First Name');
      return value;
    },
      /* z */ 'cast[].lastName': (value: string) => {
      if (!value) throw optionalWarning('Principal Cast Last Name');
      return value;
    },
      /* aa */ 'cast[].status': (value: string) => {
      if (!value) throw optionalWarning('Principal Cast Status');
      const status = getKeyIfExists('memberStatus', value);
      if (!status) throw wrongValueError(value, 'Principal Cast Status');
      return status;
    },
      /* ab */ 'prizes[].name': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Festival Name');
      const festival = getKeyIfExists('festival', value);
      if (!festival) throw wrongValueError(value, 'Festival Prizes Festival Name');
      return festival;
    },
      /* ac */ 'prizes[].year': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Year');
      const year = Number(value);
      if (isNaN(year)) throw wrongValueError(value, 'Festival Prizes Year');
      return year;
    },
      /* ad */ 'prizes[].prize': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Selection/Prize');
      return value;
    },
      /* ae */ 'prizes[].premiere': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Premiere');
      const premiere = getKeyIfExists('premiereType', value);
      if (!premiere) throw wrongValueError(value, 'Festival Prizes Premiere');
      return premiere;
    },
      /* af */ logline: (value: string) => {
      if (!value) throw optionalWarning('Logline');
      return value;
    },
      /* ag */ synopsis: (value: string) => {
      // ! required
      if (!value) throw mandatoryError(value, 'Synopsis');
      return value;
    },
      /* ah */ keyAssets: (value: string) => {
      if (!value) throw optionalWarning('Key Assets');
      return value;
    },
      /* ai */ 'keywords[]': (value: string) => {
      if (!value) throw optionalWarning('Keywords');
      return value;
    },
      /* aj */ 'producers[].firstName': (value: string) => {
      if (!value) throw optionalWarning('Producer(s) First Name');
      return value;
    },
      /* ak */ 'producers[].lastName': (value: string) => {
      if (!value) throw optionalWarning('Producer(s) Last Name');
      return value;
    },
      /* al */ 'producers[].role': (value: string) => {
      if (!value) throw optionalWarning('Producer(s) Role');
      const role = getKeyIfExists('producerRoles', value);
      if (!role) throw wrongValueError(value, 'Producer(s) Role');
      return role;
    },
      /* am */ 'crew[].firstName': (value: string) => {
      if (!value) throw optionalWarning('Crew Member(s) First Name');
      return value;
    },
      /* an */ 'crew[].lastName': (value: string) => {
      if (!value) throw optionalWarning('Crew Member(s) Last Name');
      return value;
    },
      /* ao */ 'crew[].role': (value: string) => {
      if (!value) throw optionalWarning('Crew Member(s) Role');
      const role = getKeyIfExists('crewRoles', value);
      if (!role) throw wrongValueError(value, 'Crew Member(s) Role');
      return role;
    },
      /* ap */ estimatedBudget: (value: string) => {
      if (!value) throw optionalWarning('Budget Range');
      const budget = getKeyIfExists('budgetRange', value);
      if (!budget) throw wrongValueError(value, 'Budget Range');
      return budget;
    },
      /* aq */ 'boxOffice[].territory': (value: string) => {
      if (!value) throw optionalWarning('Box Office Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Box Office Country');
      return country;
    },
      /* ar */ 'boxOffice[].unit': (value: string) => {
      if (!value) throw optionalWarning('Box Office Metric');
      const unit = getKeyIfExists('unitBox', value);
      if (!unit) throw wrongValueError(value, 'Box Office Metric');
      return unit;
    },
      /* as */ 'boxOffice[].value': (value: string) => {
      if (!value) throw optionalWarning('Box Office Number');
      const num = Number(value);
      if (!num) throw wrongValueError(value, 'Box Office Number');
      return num;
    },
      /* at */ 'certifications[]': (value: string) => {
      if (!value) throw optionalWarning('Certification');
      const certification = getKeyIfExists('certifications', value);
      if (!certification) throw wrongValueError(value, 'Certification');
      return certification;
    },
      /* au */ 'rating[].country': (value: string) => {
      if (!value) throw optionalWarning('Ratings Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError(value, 'Ratings Country');
      return country;
    },
      /* av */ 'rating[].value': (value: string) => {
      if (!value) throw optionalWarning('Ratings Value');
      return value;
    },
      /* aw */ 'audience.targets[]': (value: string) => {
      if (!value) throw optionalWarning('Target Audience');
      return value;
    },
      /* ax */ 'audience.goals[]': (value: string) => {
      if (!value) throw optionalWarning('Social Responsibility Goals');
      const valid = getKeyIfExists('socialGoals', value);
      if (!valid) throw wrongValueError(value, 'Social Responsibility Goals');
      return valid;
    },
      /* ay */ 'review[].criticName': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Critic Name');
      return value;
    },
      /* az */ 'review[].journalName': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Revue or Journal');
      return value;
    },
      /* ba */ 'review[].revueLink': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Link');
      return value;
    },
      /* bb */ 'review[].criticQuote': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Quote');
      return value;
    },
      /* bc */ color: (value: string) => {
      if (!value) throw optionalWarning('Color / Black & White');
      const color = getKeyIfExists('colors', value);
      if (!color) throw wrongValueError(value, 'Color / Black & White');
      return color;
    },
      /* bd */ format: (value: string) => {
      if (!value) throw optionalWarning('Shooting Format');
      const format = getKeyIfExists('movieFormat', value);
      if (!format) throw wrongValueError(value, 'Shooting Format');
      return format;
    },
      /* be */ formatQuality: (value: string) => {
      if (!value) throw optionalWarning('Available Format Quality');
      const quality = getKeyIfExists('movieFormatQuality', value);
      if (!quality) throw wrongValueError(value, 'Available Format Quality');
      return quality;
    },
      /* bf */ soundFormat: (value: string) => {
      if (!value) throw optionalWarning('Sound Format');
      const sound = getKeyIfExists('soundFormat', value);
      if (!sound) throw wrongValueError(value, 'Sound Format');
      return sound;
    },
      /* bg */ isOriginalVersionAvailable: (value: string) => {
      if (!value) throw optionalWarning('Original Version Authorized');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Original Version Authorized');
      return lower === 'yes';
    },
      /* bh */ 'languages[].language': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Language');
      const language = getKeyIfExists('languages', value);
      if (!language) throw wrongValueError(value, 'Available Version(s) Language');
      return language;
    },
      /* bi */ 'languages[].dubbed': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Dubbed');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Available Version(s) Dubbed');
      return lower === 'yes';
    },
      /* bj */ 'languages[].subtitle': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Subtitle');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Available Version(s) Subtitle');
      return lower === 'yes';
    },
      /* bk */ 'languages[].caption': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Caption');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError(value, 'Available Version(s) Caption');
      return lower === 'yes';
    },
      /* bl */ salesPitch: (value: string) => {
      if (!value) throw optionalWarning('Sales Pitch');
      return value;
    },

    // these columns will only be called if an admin template is used in lieu of a seller template.
    /* bm */ 'app.catalog': async (value: string) => {
      if (value) throw wrongTemplateError('admin');
      return null;
    },
    /* bn */ 'app.festival': async (value: string) => {
      if (value) throw wrongTemplateError('admin');
      return null;
    },
    /* bo */ 'app.financiers': async (value: string) => {
      if (value) throw wrongTemplateError('admin');
      return null;
    },
    /* bp */ orgIds: async (value: string) => {
      if (value) throw wrongTemplateError('admin');
      return null;
    },
    /* bq */ id: async (value: string) => {
      if (value) throw wrongTemplateError('admin');
      return null;
    }
  };

  return blockframesAdmin ? adminFieldsConfig : sellerFieldsConfig;
}
