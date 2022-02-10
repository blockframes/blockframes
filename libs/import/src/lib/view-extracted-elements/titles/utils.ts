
import { App } from '@blockframes/utils/apps';
import { User, UserService } from '@blockframes/user/+state';
import { mandatoryError, MovieImportState, wrongValueError, optionalWarning, getDate, adminOnlyWarning, getUser, unknownEntityError } from '@blockframes/import/utils';
import { createMovie } from '@blockframes/movie/+state';
import { extract, ExtractConfig, SheetTab } from '@blockframes/utils/spreadsheet';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { LanguageRecord, MovieAppConfig, MovieGoalsAudience, MovieRelease, MovieRunningTime, MovieStakeholders } from '@blockframes/movie/+state/movie.firestore';
import { Certification, Color, ContentType, CrewRole, Genre, Language, MediaValue, MovieFormat, MovieFormatQuality, NumberRange, PremiereType, ProducerRole, ProductionStatus, SocialGoal, SoundFormat, StakeholderRole, StoreStatus, Territory } from '@blockframes/utils/static-model';
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
      if (!value) return optionalWarning('International Title');
      return value;
    },
    /* b */ 'title.original': (value: string) => { // ! required
      if (!value) return mandatoryError('Original Title');
      return value;
    },
    /* c */ 'internalRef': (value: string) => {
      if (!value) return optionalWarning('Internal Ref');
      return value;
    },
    /* d */ 'contentType': (value: string) => { // ! required
      if (!value) return mandatoryError('Content Type');
      const key = getKeyIfExists('contentType', value) as ContentType;
      if (!key) return wrongValueError('Content Type');
      return key
    },
    /* e */ 'title.series': (value: string) => {
      if (!value) return optionalWarning('Season Number');
      const series = Number(value);
      if (isNaN(series)) return wrongValueError('Season Number');
      return series;
    },
    /* f */ 'runningTime.episodeCount': (value: string) => {
      if (!value) return optionalWarning('Number of Episodes');
      const count = Number(value);
      if (isNaN(count)) return wrongValueError('Number of Episodes');
      return count;
    },
    /* g */ 'productionStatus': (value: string) => {
      if (!value) return optionalWarning('Production Status');
      const status = getKeyIfExists('productionStatus', value) as ProductionStatus;
      if (!status) return wrongValueError('Production Status');
      return status;
    },
    /* h */ 'release.year': (value: string) => { // ! required
      if (!value) return mandatoryError('Release Year');
      const year = Number(value);
      if (isNaN(year)) return wrongValueError('Release Year');
      return year;
    },
    /* i */ 'release.status': (value: string) => { // ! required
      if (!value) return mandatoryError('Release Status');
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) return wrongValueError('Release Year');
      return status;
    },
    /* j */ 'directors[].firstName': (value: string) => {
      if (!value) return mandatoryError('Director\'s first name');
      return value;
    },
    /* k */ 'directors[].lastName': (value: string) => {
      if (!value) return mandatoryError('Director\'s last name');
      return value;
    },
    /* l */ 'directors[].description': (value: string) => {
      if (!value) return optionalWarning('Director(s) Description');
      return value;
    },
    /* m */ 'originCountries[]': (value: string) => { // ! required
      if (!value) return mandatoryError('Origin Countries');
      const territories = getKeyIfExists('territories', value) as Territory;
      if (!territories) return wrongValueError('Origin Countries');
      return territories;
    },
    /* n */ 'stakeholders[].displayName': (value: string) => {
      if (!value) return optionalWarning('Stakeholders Name');
      return value;
    },
    /* o */ 'stakeholders[].role': (value: string) => {
      if (!value) return optionalWarning('Stakeholders Role');
      const role = getKeyIfExists('stakeholderRoles', value) as StakeholderRole;
      if (!role) return wrongValueError('Stakeholders Role');
      return role;
    },
    /* p */ 'stakeholders[].countries[]': (value: string) => {
      if (!value) return optionalWarning('Stakeholders Country');
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) return wrongValueError('Stakeholders Country');
      return country;
    },
    /* q */ 'originalRelease[].country': (value: string) => {
      if (!value) return optionalWarning('Original release Country');
      const country = getKeyIfExists('territories', value) as Territory;
      if (!country) return wrongValueError('Original release Country');
      return country;
    },
    /* r */ 'originalRelease[].media': (value: string) => {
      if (!value) return optionalWarning('Original release Media');
      const media = getKeyIfExists('medias', value) as MediaValue;
      if (!media) return wrongValueError('Original release Media');
      return media;
    },
    /* s */ 'originalRelease[].date': (value: string) => {
      if (!value) return optionalWarning('Original release Date');
      return getDate(value, 'Original release Date') as Date;
    },
    /* t */ 'originalLanguages[]': (value: string) => { // ! required
      if (!value || !value.length) return mandatoryError('Original Languages');
      const languages = getKeyIfExists('languages', value) as Language;
      if (!languages) return wrongValueError('Original Languages');
      return languages;
    },
    /* u */ 'genres[]': (value: string) => { // ! required
      if (!value || !value.length) return mandatoryError('Genres');
      const genres = getKeyIfExists('genres', value) as Genre;
      if (!genres) return wrongValueError('Genres');
      return genres;
    },
    /* v */ 'customGenres[]': (value: string) => {
      if (!value || !value.length) return optionalWarning('Custom Genres');
      return value;
    },
    /* w */ 'runningTime.time': (value: string) => {
      if (!value) return optionalWarning('Running Time');
      const time = Number(value);
      if (isNaN(time)) return wrongValueError('Running Time');
      return time;
    },
    /* x */ 'runningTime.status': (value: string) => {
      if (!value) return optionalWarning('Running Time Status');
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) return wrongValueError('Running Time Status');
      return status;
    },
    /* y */ 'cast[].firstName': (value: string) => {
      if (!value) return optionalWarning('Principal Cast First Name');
      return value;
    },
    /* z */ 'cast[].lastName': (value: string) => {
      if (!value) return optionalWarning('Principal Cast Last Name');
      return value;
    },
    /* aa */ 'cast[].status': (value: string) => {
      if (!value) return optionalWarning('Principal Cast Status');
      const status = getKeyIfExists('memberStatus', value);
      if (!status) return wrongValueError('Principal Cast Status');
      return status;
    },
    /* ab */ 'prizes[].name': (value: string) => {
      if (!value) return optionalWarning('Festival Prizes Festival Name');
      const festival = getKeyIfExists('festival', value);
      if (!festival) return wrongValueError('Festival Prizes Festival Name');
      return festival;
    },
    /* ac */ 'prizes[].year': (value: string) => {
      if (!value) return optionalWarning('Festival Prizes Year');
      const year = Number(value);
      if (isNaN(year)) return wrongValueError('Festival Prizes Year');
      return year;
    },
    /* ad */ 'prizes[].prize': (value: string) => {
      if (!value) return optionalWarning('Festival Prizes Selection/Prize');
      return value;
    },
    /* ae */ 'prizes[].premiere': (value: string) => {
      if (!value) return optionalWarning('Festival Prizes Premiere');
      const premiere = getKeyIfExists('premiereType', value) as PremiereType;
      if (!premiere) return wrongValueError('Festival Prizes Premiere');
      return premiere;
    },
    /* af */ 'logline': (value: string) => {
      if (!value) return optionalWarning('Logline');
      return value;
    },
    /* ag */ 'synopsis': (value: string) => { // ! required
      if (!value) return mandatoryError('Synopsis');
      return value;
    },
    /* ah */ 'keyAssets': (value: string) => {
      if (!value) return optionalWarning('Key Assets');
      return value;
    },
    /* ai */ 'keywords[]': (value: string) => {
      if (!value) return optionalWarning('Keywords');
      return value;
    },
    /* aj */ 'producers[].firstName': (value: string) => {
      if (!value) return optionalWarning('Producer(s) First Name');
      return value;
    },
    /* ak */ 'producers[].lastName': (value: string) => {
      if (!value) return optionalWarning('Producer(s) Last Name');
      return value;
    },
    /* al */ 'producers[].role': (value: string) => {
      if (!value) return optionalWarning('Producer(s) Role');
      const role = getKeyIfExists('producerRoles', value) as ProducerRole;
      if (!role) return wrongValueError('Producer(s) Role');
      return role;
    },
    /* am */ 'crew[].firstName': (value: string) => {
      if (!value) return optionalWarning('Crew Member(s) First Name');
      return value;
    },
    /* an */ 'crew[].lastName': (value: string) => {
      if (!value) return optionalWarning('Crew Member(s) Last Name');
      return value;
    },
    /* ao */ 'crew[].role': (value: string) => {
      if (!value) return optionalWarning('Crew Member(s) Role');
      const role = getKeyIfExists('crewRoles', value) as CrewRole;
      if (!role) return wrongValueError('Crew Member(s) Role');
      return role;
    },
    /* ap */ 'budgetRange': (value: string) => {
      if (!value) return optionalWarning('Budget Range');
      const budget = getKeyIfExists('budgetRange', value);
      if (!budget) return wrongValueError('Budget Range');
      return budget as any;
    },
    /* aq */ 'boxoffice[].territory': (value: string) => {
      if (!value) return optionalWarning('Box Office Country');
      const country = getKeyIfExists('territories', value);
      if (!country) return wrongValueError('Box Office Country');
      return country;
    },
    /* ar */ 'boxoffice[].unit': (value: string) => {
      if (!value) return optionalWarning('Box Office Metric');
      const unit = getKeyIfExists('unitBox', value);
      if (!unit) return wrongValueError('Box Office Metric');
      return unit;
    },
    /* as */ 'boxoffice[].value': (value: string) => {
      if (!value) return optionalWarning('Box Office Number');
      const num = Number(value);
      if (!num) return wrongValueError('Box Office Number');
      return num;
    },
    /* at */ 'certifications[]': (value: string) => {
      if (!value) return optionalWarning('Certification');
      const certification = getKeyIfExists('certifications', value) as Certification;
      if (!certification) return wrongValueError('Certification');
      return certification;
    },
    /* au */ 'ratings[].country': (value: string) => {
      if (!value) return optionalWarning('Ratings Country');
      const country = getKeyIfExists('territories', value);
      if (!country) return wrongValueError('Ratings Country');
      return country;
    },
    /* av */ 'ratings[].value': (value: string) => {
      if (!value) return optionalWarning('Ratings Value');
      return value;
    },
    /* aw */ 'audience.targets[]': (value: string) => {
      if (!value) return optionalWarning('Target Audience');
      return value;
    },
    /* ax */ 'audience.goals[]': (value: string) => {
      if (!value) return optionalWarning('Social Responsibility Goals');
      const valid = getKeyIfExists('socialGoals', value);
      if (!valid) return wrongValueError('Social Responsibility Goals');
      return value as SocialGoal;
    },
    /* ay */ 'reviews[].filmCriticName': (value: string) => {
      if (!value) return optionalWarning('Film Reviews Critic Name');
      return value;
    },
    /* az */ 'reviews[].revue': (value: string) => {
      if (!value) return optionalWarning('Film Reviews Revue or Journal');
      return value;
    },
    /* ba */ 'reviews[].link': (value: string) => {
      if (!value) return optionalWarning('Film Reviews Link');
      return value;
    },
    /* bb */ 'reviews[].quote': (value: string) => {
      if (!value) return optionalWarning('Film Reviews Quote');
      return value;
    },
    /* bc */ 'color': (value: string) => {
      if (!value) return optionalWarning('Color / Black & White');
      const color = getKeyIfExists('colors', value) as Color;
      if (!color) return wrongValueError('Color / Black & White');
      return color;
    },
    /* bd */ 'format': (value: string) => {
      if (!value) return optionalWarning('Shooting Format');
      const format = getKeyIfExists('movieFormat', value) as MovieFormat;
      if (!format) return wrongValueError('Shooting Format');
      return format;
    },
    /* be */ 'formatQuality': (value: string) => {
      if (!value) return optionalWarning('Available Format Quality');
      const quality = getKeyIfExists('movieFormatQuality', value) as MovieFormatQuality;
      if (!quality) return wrongValueError('Available Format Quality');
      return quality;
    },
    /* bf */ 'soundFormat': (value: string) => {
      if (!value) return optionalWarning('Sound Format');
      const sound = getKeyIfExists('soundFormat', value) as SoundFormat;
      if (!sound) return wrongValueError('Sound Format');
      return sound;
    },
    /* bg */ 'isOriginalVersionAvailable': (value: string) => {
      if (!value) return optionalWarning('Original Version Authorized');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) return wrongValueError('Original Version Authorized');
      return lower === 'yes';
    },
    /* bh */ 'languages[].language': (value: string) => {
      if (!value) return optionalWarning('Available Version(s) Language');
      const language = getKeyIfExists('languages', value);
      if (!language) return wrongValueError('Available Version(s) Language');
      return language;
    },
    /* bi */ 'languages[].dubbed': (value: string) => {
      if (!value) return optionalWarning('Available Version(s) Dubbed');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) return wrongValueError('Available Version(s) Dubbed');
      return lower === 'yes';
    },
    /* bj */ 'languages[].subtitle': (value: string) => {
      if (!value) return optionalWarning('Available Version(s) Subtitle');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) return wrongValueError('Available Version(s) Subtitle');
      return lower === 'yes';
    },
    /* bk */ 'languages[].caption': (value: string) => {
      if (!value) return optionalWarning('Available Version(s) Caption');
      const lower = value.toLowerCase();
      const valid = lower === 'yes' || lower === 'no';
      if (!valid) return wrongValueError('Available Version(s) Caption');
      return lower === 'yes';
    },
    /* bl */ 'salesPitch': (value: string) => {
      if (!value) return optionalWarning('Sales Pitch');
      return value;
    },

    // ! ADMIN
    /* bm */ 'app.catalog': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = { status: 'draft', access: 'catalog' === currentApp, acceptedAt: null, refusedAt: null };

      if (!value && blockframesAdmin) return optionalWarning('Catalog Status', defaultAccess);
      if (value && !blockframesAdmin) return adminOnlyWarning(defaultAccess, 'Catalog Status');
      if (value && !blockframesAdmin) return adminOnlyWarning(defaultAccess, 'Catalog Status');
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) return wrongValueError('Catalog Status');

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bn */ 'app.festival': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = { status: 'draft', access: 'festival' === currentApp, acceptedAt: null, refusedAt: null };

      if (!value && blockframesAdmin) return optionalWarning('Festival Status', defaultAccess);
      if (value && !blockframesAdmin) return adminOnlyWarning(defaultAccess, 'Festival Status');
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) return wrongValueError('Festival Status');

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bo */ 'app.financiers': (value: string) => {
      const defaultAccess: MovieAppConfig<Date> = { status: 'draft', access: 'financiers' === currentApp, acceptedAt: null, refusedAt: null };

      if (!value && blockframesAdmin) return optionalWarning('Financiers Status', defaultAccess);
      if (value && !blockframesAdmin) return adminOnlyWarning(defaultAccess, 'Financiers Status');
      if (!value) return defaultAccess;

      const status = getKeyIfExists('storeStatus', value) as StoreStatus;
      if (!status) return wrongValueError('Financiers Status');

      return { status, access: true, acceptedAt: null, refusedAt: null };
    },
    /* bp */ 'orgIds': async (value: string) => { // ! required
      if (!value && blockframesAdmin) return mandatoryError('Owner Id');
      if (value && !blockframesAdmin) return adminOnlyWarning([userOrgId], 'Owner Id');
      if (!value) return [userOrgId];
      const user = await getUser({ id: value }, userService, userCache);
      if (!user) return unknownEntityError('Owner Id');
      return [user.orgId];
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 10);

  for (const result of results) {
    const { data, errors } = result;

    if (!data.stakeholders) {
      errors.push(optionalWarning('Stakeholders').error);
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

    const languages: LanguageRecord = {};
    if (!data.languages) {
      errors.push(optionalWarning('Languages').error);
    } else {
      for (const { language, dubbed, subtitle, caption } of data.languages) {
        languages[language] = { dubbed, subtitle, caption };
      }
    }

    const title = createMovie({ ...data, languages, stakeholders });

    if (!title.directors || !title.directors.length) errors.push({
      type: 'error',
      name: 'Missing Director(s)',
      reason: 'You need to fill at least one Director',
      hint: 'Please edit the corresponding sheets field'
    });

    titles.push({ errors,  movie: title });
  }

  return titles;
}
