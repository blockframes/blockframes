import { App } from '@blockframes/utils/apps';
import { UserService } from '@blockframes/user/+state';
import {
  mandatoryError,
  MovieImportState,
  wrongValueError,
  optionalWarning,
  getDate,
  adminOnlyWarning,
  getUser,
  unknownEntityError,
  getOptionalWarning,
} from '@blockframes/import/utils';
import { extract, ExtractConfig, SheetTab } from '@blockframes/utils/spreadsheet';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import {
  LanguageRecord,
  MovieAppConfig,
  MovieGoalsAudience,
  MovieRelease,
  MovieRunningTime,
  MovieStakeholders,
  User,
  createMovie,
  Stakeholder,
  Certification,
  Color,
  ContentType,
  CrewRole,
  Genre,
  Language,
  MediaValue,
  MemberStatus,
  MovieFormat,
  MovieFormatQuality,
  NumberRange,
  PremiereType,
  ProducerRole,
  ProductionStatus,
  ScreeningStatus,
  SoundFormat,
  StakeholderRole,
  StoreStatus,
  Territory
} from '@blockframes/model';

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
  app: Partial<{ [app in App]: MovieAppConfig<Date> }>;

  orgIds: string[];
}

// type FieldsConfigType = ExtractConfig<FieldsConfig>;
type FieldsConfigType = ExtractConfig<FieldsConfig>;

export async function formatTitle(
  sheetTab: SheetTab,
  userService: UserService,
  blockframesAdmin: boolean,
  userOrgId: string,
  currentApp: App
) {
  const titles: MovieImportState[] = [];

  const userCache: Record<string, User> = {};

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */ 'title.international': (value: string) => {
      if (!value) throw optionalWarning('International Title');
      return value;
    },
    /* b */ 'title.original': (value: string) => {
      // ! required
      if (!value) throw mandatoryError('Original Title');
      return value;
    },
    /* c */ internalRef: (value: string) => {
      if (!value) throw optionalWarning('Internal Ref');
      return value;
    },
    /* d */ contentType: (value: string) => {
      // ! required
      if (!value) throw mandatoryError('Content Type');
      const key = getKeyIfExists('contentType', value) as ContentType;
      if (!key) throw wrongValueError('Content Type');
      return key;
    },
    /* e */ 'title.series': (value: string) => {
      if (!value) throw optionalWarning('Season Number');
      const series = Number(value);
      if (isNaN(series)) throw wrongValueError('Season Number');
      return series;
    },
    /* f */ 'runningTime.episodeCount': (value: string) => {
      if (!value) throw optionalWarning('Number of Episodes');
      const count = Number(value);
      if (isNaN(count)) throw wrongValueError('Number of Episodes');
      return count;
    },
    /* g */ productionStatus: (value: string) => {
      if (!value) throw optionalWarning('Production Status');
      const status = getKeyIfExists('productionStatus', value) as ProductionStatus;
      if (!status) throw wrongValueError('Production Status');
      return status;
    },
    /* h */ 'release.year': (value: string) => {
      // ! required
      if (!value) throw mandatoryError('Release Year');
      const year = Number(value);
      if (isNaN(year)) throw wrongValueError('Release Year');
      return year;
    },
    /* i */ 'release.status': (value: string) => {
      // ! required
      if (!value) throw mandatoryError('Release Status');
      const status = getKeyIfExists('screeningStatus', value) as ScreeningStatus;
      if (!status) throw wrongValueError('Release Year');
      return status;
    },
    /* j */ 'directors[].firstName': (value: string) => {
      if (!value) throw mandatoryError("Director's first name");
      return value;
    },
    /* k */ 'directors[].lastName': (value: string) => {
      if (!value) throw mandatoryError("Director's last name");
      return value;
    },
    /* l */ 'directors[].description': (value: string) => {
      if (!value) throw optionalWarning('Director(s) Description');
      return value;
    },
    /* m */ 'originCountries[]': (value: string) => {
      // ! required
      if (!value) throw mandatoryError('Origin Countries');
      const territories = getKeyIfExists('territories', value) as Territory;
      if (!territories) throw wrongValueError('Origin Countries');
      return territories;
    },
    /* n */ 'stakeholders[].displayName': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Name');
      return value;
    },
    /* o */ 'stakeholders[].role': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Role');
      const role = getKeyIfExists('stakeholderRoles', value) as StakeholderRole;
      if (!role) throw wrongValueError('Stakeholders Role');
      return role;
    },
    /* p */ 'stakeholders[].countries[]': (value: string) => {
      if (!value) throw optionalWarning('Stakeholders Country');
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) throw wrongValueError('Stakeholders Country');
      return country;
    },
    /* q */ 'originalRelease[].country': (value: string) => {
      if (!value) throw optionalWarning('Original release Country');
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) throw wrongValueError('Original release Country');
      return country;
    },
    /* r */ 'originalRelease[].media': (value: string) => {
      if (!value) throw optionalWarning('Original release Media');
      const media = getKeyIfExists('medias', value) as MediaValue;
      if (!media) throw wrongValueError('Original release Media');
      return media;
    },
    /* s */ 'originalRelease[].date': (value: string) => {
      if (!value) throw optionalWarning('Original release Date');
      return getDate(value, 'Original release Date') as Date;
    },
    /* t */ 'originalLanguages[]': (value: string) => {
      // ! required
      if (!value || !value.length) throw mandatoryError('Original Languages');
      const languages = getKeyIfExists('languages', value) as Language;
      if (!languages) throw wrongValueError('Original Languages');
      return languages;
    },
    /* u */ 'genres[]': (value: string) => {
      // ! required
      if (!value || !value.length) throw mandatoryError('Genres');
      const genres = getKeyIfExists('genres', value) as Genre;
      if (!genres) throw wrongValueError('Genres');
      return genres;
    },
    /* v */ 'customGenres[]': (value: string) => {
      if (!value || !value.length) throw optionalWarning('Custom Genres');
      return value;
    },
    /* w */ 'runningTime.time': (value: string) => {
      if (!value) throw optionalWarning('Running Time');
      const time = Number(value);
      if (isNaN(time)) throw wrongValueError('Running Time');
      return time;
    },
    /* x */ 'runningTime.status': (value: string) => {
      if (!value) throw optionalWarning('Running Time Status');
      const status = getKeyIfExists('screeningStatus', value) as ScreeningStatus;
      if (!status) throw wrongValueError('Running Time Status');
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
      const status = getKeyIfExists('memberStatus', value) as MemberStatus;
      if (!status) throw wrongValueError('Principal Cast Status');
      return status;
    },
    /* ab */ 'prizes[].name': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Festival Name');
      const festival = getKeyIfExists('festival', value);
      if (!festival) throw wrongValueError('Festival Prizes Festival Name');
      return festival;
    },
    /* ac */ 'prizes[].year': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Year');
      const year = Number(value);
      if (isNaN(year)) throw wrongValueError('Festival Prizes Year');
      return year;
    },
    /* ad */ 'prizes[].prize': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Selection/Prize');
      return value;
    },
    /* ae */ 'prizes[].premiere': (value: string) => {
      if (!value) throw optionalWarning('Festival Prizes Premiere');
      const premiere = getKeyIfExists('premiereType', value) as PremiereType;
      if (!premiere) throw wrongValueError('Festival Prizes Premiere');
      return premiere;
    },
    /* af */ logline: (value: string) => {
      if (!value) throw optionalWarning('Logline');
      return value;
    },
    /* ag */ synopsis: (value: string) => {
      // ! required
      if (!value) throw mandatoryError('Synopsis');
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
      const role = getKeyIfExists('producerRoles', value) as ProducerRole;
      if (!role) throw wrongValueError('Producer(s) Role');
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
      const role = getKeyIfExists('crewRoles', value) as CrewRole;
      if (!role) throw wrongValueError('Crew Member(s) Role');
      return role;
    },
    /* ap */ budgetRange: (value: string) => {
      if (!value) throw optionalWarning('Budget Range');
      const budget = getKeyIfExists('budgetRange', value);
      if (!budget) throw wrongValueError('Budget Range');
      return budget as any;
    },
    /* aq */ 'boxoffice[].territory': (value: string) => {
      if (!value) throw optionalWarning('Box Office Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError('Box Office Country');
      return country;
    },
    /* ar */ 'boxoffice[].unit': (value: string) => {
      if (!value) throw optionalWarning('Box Office Metric');
      const unit = getKeyIfExists('unitBox', value);
      if (!unit) throw wrongValueError('Box Office Metric');
      return unit;
    },
    /* as */ 'boxoffice[].value': (value: string) => {
      if (!value) throw optionalWarning('Box Office Number');
      const num = Number(value);
      if (!num) throw wrongValueError('Box Office Number');
      return num;
    },
    /* at */ 'certifications[]': (value: string) => {
      if (!value) throw optionalWarning('Certification');
      const certification = getKeyIfExists('certifications', value) as Certification;
      if (!certification) throw wrongValueError('Certification');
      return certification;
    },
    /* au */ 'ratings[].country': (value: string) => {
      if (!value) throw optionalWarning('Ratings Country');
      const country = getKeyIfExists('territories', value);
      if (!country) throw wrongValueError('Ratings Country');
      return country;
    },
    /* av */ 'ratings[].value': (value: string) => {
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
      if (!valid) throw wrongValueError('Social Responsibility Goals');
      return valid;
    },
    /* ay */ 'reviews[].filmCriticName': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Critic Name');
      return value;
    },
    /* az */ 'reviews[].revue': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Revue or Journal');
      return value;
    },
    /* ba */ 'reviews[].link': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Link');
      return value;
    },
    /* bb */ 'reviews[].quote': (value: string) => {
      if (!value) throw optionalWarning('Film Reviews Quote');
      return value;
    },
    /* bc */ color: (value: string) => {
      if (!value) throw optionalWarning('Color / Black & White');
      const color = getKeyIfExists('colors', value) as Color;
      if (!color) throw wrongValueError('Color / Black & White');
      return color;
    },
    /* bd */ format: (value: string) => {
      if (!value) throw optionalWarning('Shooting Format');
      const format = getKeyIfExists('movieFormat', value) as MovieFormat;
      if (!format) throw wrongValueError('Shooting Format');
      return format;
    },
    /* be */ formatQuality: (value: string) => {
      if (!value) throw optionalWarning('Available Format Quality');
      const quality = getKeyIfExists('movieFormatQuality', value) as MovieFormatQuality;
      if (!quality) throw wrongValueError('Available Format Quality');
      return quality;
    },
    /* bf */ soundFormat: (value: string) => {
      if (!value) throw optionalWarning('Sound Format');
      const sound = getKeyIfExists('soundFormat', value) as SoundFormat;
      if (!sound) throw wrongValueError('Sound Format');
      return sound;
    },
    /* bg */ isOriginalVersionAvailable: (value: string) => {
      if (!value) throw optionalWarning('Original Version Authorized');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError('Original Version Authorized');
      return lower === 'yes';
    },
    /* bh */ 'languages[].language': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Language');
      const language = getKeyIfExists('languages', value);
      if (!language) throw wrongValueError('Available Version(s) Language');
      return language;
    },
    /* bi */ 'languages[].dubbed': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Dubbed');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError('Available Version(s) Dubbed');
      return lower === 'yes';
    },
    /* bj */ 'languages[].subtitle': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Subtitle');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError('Available Version(s) Subtitle');
      return lower === 'yes';
    },
    /* bk */ 'languages[].caption': (value: string) => {
      if (!value) throw optionalWarning('Available Version(s) Caption');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) throw wrongValueError('Available Version(s) Caption');
      return lower === 'yes';
    },
    /* bl */ salesPitch: (value: string) => {
      if (!value) throw optionalWarning('Sales Pitch');
      return value;
    },

    // ! ADMIN
    /* bm */ 'app.catalog': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = {
        status: 'draft',
        access: 'catalog' === currentApp,
        acceptedAt: null,
        refusedAt: null,
      };

      if (!value && blockframesAdmin) throw optionalWarning('Catalog Status', defaultAccess);
      if (value && !blockframesAdmin) throw adminOnlyWarning(defaultAccess, 'Catalog Status');
      if (value && !blockframesAdmin) throw adminOnlyWarning(defaultAccess, 'Catalog Status');
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) throw wrongValueError('Catalog Status');

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bn */ 'app.festival': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = {
        status: 'draft',
        access: 'festival' === currentApp,
        acceptedAt: null,
        refusedAt: null,
      };

      if (!value && blockframesAdmin) throw optionalWarning('Festival Status', defaultAccess);
      if (value && !blockframesAdmin) throw adminOnlyWarning(defaultAccess, 'Festival Status');
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) throw wrongValueError('Festival Status');

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bo */ 'app.financiers': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = {
        status: 'draft',
        access: 'financiers' === currentApp,
        acceptedAt: null,
        refusedAt: null,
      };

      if (!value && blockframesAdmin) throw optionalWarning('Financiers Status', defaultAccess);
      if (value && !blockframesAdmin) throw adminOnlyWarning(defaultAccess, 'Financiers Status');
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) throw wrongValueError('Financiers Status');

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bp */ orgIds: async (value: string) => {
      // ! required
      if (!value && blockframesAdmin) throw mandatoryError('Owner Id');
      if (value && !blockframesAdmin) throw adminOnlyWarning([userOrgId], 'Owner Id');
      if (!value) return [userOrgId];
      const user = await getUser({ id: value }, userService, userCache);
      if (!user) throw unknownEntityError('Owner Id');
      return [user.orgId];
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 10);

  for (const result of results) {
    const { data, errors } = result;

    if (!data.stakeholders) {
      errors.push(getOptionalWarning('Stakeholders'));
    }

    const getStakeholders = (role: StakeholderRole): Stakeholder[] =>
      data.stakeholders?.filter((s) => s.role === role) ?? [];

    const stakeholders: MovieStakeholders = {
      productionCompany: getStakeholders('executiveProducer'),
      coProductionCompany: getStakeholders('coProducer'),
      broadcasterCoproducer: getStakeholders('broadcasterCoproducer'),
      lineProducer: getStakeholders('lineProducer'),
      distributor: getStakeholders('distributor'),
      salesAgent: getStakeholders('salesAgent'),
      laboratory: getStakeholders('laboratory'),
      financier: getStakeholders('financier'),
    };

    const languages: LanguageRecord = {};
    if (!data.languages) {
      errors.push(getOptionalWarning('Languages'));
    } else {
      for (const { language, dubbed, subtitle, caption } of data.languages) {
        languages[language] = { dubbed, subtitle, caption };
      }
    }

    const title = createMovie({ ...data, languages, stakeholders });

    if (!title.directors || !title.directors.length)
      errors.push({
        type: 'error',
        name: 'Missing Director(s)',
        reason: 'You need to fill at least one Director',
        message: 'Please edit the corresponding sheets field',
      });

    titles.push({ errors, movie: title });
  }

  return titles;
}
