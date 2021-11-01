
import { App } from '@blockframes/utils/apps';
import { UserService } from '@blockframes/user/+state';
import { MandatoryError, MovieImportState, WrongValueError, optionalWarning } from '@blockframes/import/utils';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { createMovie, Movie, MovieService } from '@blockframes/movie/+state';
import { Crew, Producer } from '@blockframes/utils/common-interfaces';
import { extract, ExtractConfig, getStaticList, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
import {
  formatCredits,
  formatOriginalLanguages,
  formatOriginalRelease,
  formatOriginCountries,
  formatProductionStatus,
  formatReleaseYear,
  formatSingleValue,
  formatStakeholders,
  formatGenres,
  formatRunningTime,
  formatPrizes,
  formatBoxOffice,
  formatCertifications,
  formatRatings,
  formatReview,
  formatAvailableLanguages,
  formatAudienceGoals,
} from '@blockframes/utils/spreadsheet/format';
import { getKeyIfExists } from '@blockframes/utils/helpers';
import { MovieRelease, MovieRunningTime } from '@blockframes/movie/+state/movie.firestore';
import { Genre, Language, Territory } from '@blockframes/utils/static-model';

interface FieldsConfig {
  title: {
    international: string;
    original: string;
    series: number;
  };
  internalRef: string;
  contentType: string;
  productionStatus: string;
  release: MovieRelease;
  directors: {
    firstName: string; lastName: string;
    description: string
  }[];
  originCountries: Territory[];
  stakeholders: {
    displayName: string; role: string;
    country:string;
  }[];
  originalRelease: {
    country: string; media: string;
    date: string
  }[];
  originalLanguages: Language[];
  genres: Genre[];
  customGenres: string[];
  runningTime: MovieRunningTime;
  cast: {
    firstName: string; lastName: string; status: string
  }[];
  prizes: {
    name: string; year: string;
    prize: string; premiere: string;
  }[];
  logline: string;
  synopsis: string;
  keyAssets: string;
  keywords: string[];
  producers: {
    firstName: string; lastName: string; role: string
  }[];
  crew: {
    firstName: string; lastName: string; role: string
  }[];
  budgetRange: string;
  boxoffice: {
    territory: string; unit: string; value: string
  }[];
  certifications: string[];
  ratings: { country: string; value: string; }[];
  audience: { targets: string; goals: string; }[];
  reviews: {
    filmCriticName: string; revue: string;
    link: string; quote: string;
  }[];
  color: string;
  format: string;
  formatQuality: string;
  soundFormat: string;
  isOriginalVersionAvailable: string;
  languages: {
    language: string; dubbed: string;
    subtitle: string; caption: string;
  }[];
  salesPitch: string;
  catalogStatus: string;
  festivalStatus: string;
  financiersStatus: string;
  ownerId: string;
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


function validateMovie(importErrors: MovieImportState): MovieImportState {
  const movie = importErrors.movie;
  const errors = importErrors.errors;

  //////////////////
  // OPTIONAL FIELDS
  //////////////////


  if (!movie.runningTime.time) {
    errors.push({
      type: 'warning',
      field: 'movie.runningTime.time',
      name: 'Total Run Time',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (!movie.runningTime.status) {
    errors.push({
      type: 'warning',
      field: 'movie.runningTime.status',
      name: 'Running type status',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  let stakeholdersCount = 0;
  Object.keys(movie.stakeholders).forEach(k => { stakeholdersCount += k.length });
  if (stakeholdersCount === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.stakeholders',
      name: 'Stakeholder(s)',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (!movie.color) {
    errors.push({
      type: 'warning',
      field: 'movie.color',
      name: 'Color / Black & White ',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.originCountries.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.originCountries',
      name: 'Countries of origin',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (!movie.certifications) {
    errors.push({
      type: 'warning',
      field: 'movie.certifications',
      name: 'Certifications',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.rating.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.rating',
      name: 'Rating',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.cast.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.cast',
      name: "Principal Cast",
      reason: 'Optional fields are missing',
      hint: 'Edit corresponding sheets fields: directors, principal cast.'
    });
  }

  if (!movie.synopsis) {
    errors.push({
      type: 'warning',
      field: 'movie.synopsis',
      name: 'Synopsis',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.genres.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.genres',
      name: 'Genres',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.customPrizes.length === 0 && movie.prizes.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.prizes',
      name: 'Festival Prizes',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.keyAssets.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.keyAssets',
      name: 'Key assets',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.keywords.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.keywords',
      name: 'Keywords',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.originalLanguages.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.originalLanguages',
      name: 'Languages',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.languages === {}) {
    errors.push({
      type: 'warning',
      field: 'movie.languages',
      name: 'Dubbings | Subtitles | Captions ',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (!movie.logline) {
    errors.push({
      type: 'warning',
      field: 'movie.logline',
      name: 'Logline',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.review.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.review',
      name: 'Review',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.audience.goals.length === 0 && movie.audience.targets.length === 0) {
    errors.push({
      type: 'warning',
      field: 'movie.audience',
      name: 'Positioning',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (!movie.promotional.videos.salesPitch.description) {
    errors.push({
      type: 'warning',
      field: 'movie.promotional.videos.salesPitch',
      name: 'Sales Pitch',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  return importErrors;
}

export async function formatTitle(sheetTab: SheetTab, movieService: MovieService, userService: UserService, blockframesAdmin: boolean, currentApp: App, orgId?: string) {

  const titles: MovieImportState[] = [];

  // ! The order of the property should be the same as excel columns
  const fieldsConfig: FieldsConfigType = {
    /* a */ 'title.international': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'title.international', name: 'International Title' }));
      return value;
    },
    /* b */ 'title.original': (value: string) => { // ! required
      if (!value) throw new MandatoryError({ field: 'title.original', name: 'Original Title' });
      return value;
    },
    /* c */ 'internalRef': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'internalRef', name: 'Internal Ref' }));
      return value;
    },
    /* d */ 'contentType': (value: string) => { // ! required
      if (!value) throw new MandatoryError({ field: 'contentType', name: 'Content Type' });
      const key = getKeyIfExists('contentType', value);
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
      const status = getKeyIfExists('productionStatus', value);
      if (!status) throw new WrongValueError({ field: 'productionStatus', name: 'Production Status' });
      return status;
    },
    /* h */ 'release.year': (value: string) => { // ! required
      if (!value) throw new MandatoryError({ field: 'release.year', name: 'Release Year' });
      const year = Number(value);
      if (isNaN(year)) throw new WrongValueError({ field: 'release.year', name: 'Release Year' });
      return year;
    },
    /* i */ 'release.status': (value: string) => { // ! required
      if (!value) throw new MandatoryError({ field: 'release.status', name: 'Release Status' });
      const status = getKeyIfExists('screeningStatus', value);
      if (!status) throw new WrongValueError({ field: 'release.year', name: 'Release Year' });
      return status;
    },
    /* j */ 'directors[].firstName': (value: string) => { // TODO HERE
      if (!value) throw new MandatoryError({ field: 'directors[].firstName', name: 'Director\'s first name' });
      return value;
    },
    /* k */ 'directors[].lastName': (value: string) => {
      if (!value) throw new MandatoryError({ field: 'directors[].lastName', name: 'Director\'s last name' });
      return value;
    },
    /* l */ 'directors[].description': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'directors[].description', name: 'Director(s) Description' }));
      return value;
    },
    /* m */ 'originCountries[]': (value: string[]) => { // ! required
      if (!value || !value.length) throw new MandatoryError({ field: 'originCountries', name: 'Origin Countries' });
      const territories = value.map(t => getKeyIfExists('territories', t)) as Territory[];
      const hasWrongTerritory = territories.some(t => !t);
      if (hasWrongTerritory) throw new WrongValueError({ field: 'originCountries', name: 'Origin Countries' });
      return territories as any;
    },
    /* n */ 'stakeholders[].displayName': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'stakeholders[].displayName', name: 'Stakeholders Name' }));
      return value;
    },
    /* o */ 'stakeholders[].role': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'stakeholders[].role', name: 'Stakeholders Role' }));
      return value;
    },
    /* p */ 'stakeholders[].country': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'stakeholders[].country', name: 'Stakeholders Country' }));
      return value;
    },
    /* q */ 'originalRelease[].country': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'originalRelease[].country', name: 'Original release Country' }));
      return value;
    },
    /* r */ 'originalRelease[].media': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'originalRelease[].media', name: 'Original release Media' }));
      return value;
    },
    /* s */ 'originalRelease[].date': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'originalRelease[].date', name: 'Original release Date' }));
      return value;
    },
    /* t */ 'originalLanguages[]': (value: string[]) => { // ! required
      if (!value || !value.length) throw new MandatoryError({ field: 'originalLanguages', name: 'Original Languages' });
      const languages = value.map(t => getKeyIfExists('languages', t)) as Language[];
      const hasWrongLanguage = languages.some(t => !t);
      if (hasWrongLanguage) throw new WrongValueError({ field: 'originalLanguages', name: 'Original Languages' });
      return languages as any;
    },
    /* u */ 'genres[]': (value: string[]) => { // ! required
      if (!value || !value.length) throw new MandatoryError({ field: 'genres', name: 'Genres' });
      const genres = value.map(t => getKeyIfExists('genres', t)) as Language[];
      const hasWrongGenre = genres.some(t => !t);
      if (hasWrongGenre) throw new WrongValueError({ field: 'genres', name: 'Genres' });
      return genres as any;
    },
    /* v */ 'customGenres[]': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'customGenres[]', name: 'Custom Genres' }));
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
      return value;
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
      return value;
    },
    /* ab */ 'prizes[].name': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].name', name: 'Festival Prizes Festival Name' }));
      return value;
    },
    /* ac */ 'prizes[].year': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].year', name: 'Festival Prizes Year' }));
      return value;
    },
    /* ad */ 'prizes[].prize': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].prize', name: 'Festival Prizes Selection/Prize' }));
      return value;
    },
    /* ae */ 'prizes[].premiere': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'prizes[].premiere', name: 'Festival Prizes Premiere' }));
      return value;
    },
    /* af */ 'logline': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'logline', name: 'Logline' }));
      return value;
    },
    /* ag */ 'synopsis': (value: string) => { // ! required
      if (!value) throw new MandatoryError({ field: 'synopsis', name: 'Synopsis' });
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
      return value;
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
      return value;
    },
    /* ap */ 'budgetRange': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'budgetRange', name: 'Budget Range' }));
      return value;
    },
    /* aq */ 'boxoffice[].territory': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'boxoffice[].territory', name: 'Box Office Country' }));
      return value;
    },
    /* ar */ 'boxoffice[].unit': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'boxoffice[].unit', name: 'Box Office Metric' }));
      return value;
    },
    /* as */ 'boxoffice[].value': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'boxoffice[].value', name: 'Box Office Number' }));
      return value;
    },
    /* at */ 'certifications[]': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'certifications[]', name: 'Certification' }));
      return value;
    },
    /* au */ 'ratings[].country': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'ratings[].country', name: 'Ratings Country' }));
      return value;
    },
    /* av */ 'ratings[].value': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'ratings[].value', name: 'Ratings Value' }));
      return value;
    },
    /* aw */ 'audience[].targets': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'audience[].targets', name: 'Target Audience' }));
      return value;
    },
    /* ax */ 'audience[].goals': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'audience[].goals', name: 'Social Responsibility Goals' }));
      return value;
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
      return value;
    },
    /* bd */ 'format': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'format', name: 'Shooting Format' }));
      return value;
    },
    /* be */ 'formatQuality': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'formatQuality', name: 'Available Format Quality' }));
      return value;
    },
    /* bf */ 'soundFormat': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'soundFormat', name: 'Sound Format' }));
      return value;
    },
    /* bg */ 'isOriginalVersionAvailable': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'isOriginalVersionAvailable', name: 'Original Version Authorized' }));
      return value;
    },
    /* bh */ 'languages[].language': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].language', name: 'Available Version(s) Language' }));
      return value;
    },
    /* bi */ 'languages[].dubbed': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].dubbed', name: 'Available Version(s) Dubbed' }));
      return value;
    },
    /* bj */ 'languages[].subtitle': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].subtitle', name: 'Available Version(s) Subtitle' }));
      return value;
    },
    /* bk */ 'languages[].caption': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'languages[].caption', name: 'Available Version(s) Caption' }));
      return value;
    },
    /* bl */ 'salesPitch': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'salesPitch', name: 'Sales Pitch' }));
      return value;
    },

    // ! ADMIN
    /* bm */ 'catalogStatus': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'catalogStatus', name: '' }));
      return value;
    },
    /* bn */ 'festivalStatus': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'festivalStatus', name: '' }));
      return value;
    },
    /* bo */ 'financiersStatus': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'financiersStatus', name: '' }));
      return value;
    },
    /* bp */ 'ownerId': (value: string) => {
      if (!value) return new ValueWithWarning(null, optionalWarning({ field: 'ownerId', name: '' }));
      return value;
    },
  };

  const results = await extract<FieldsConfig>(sheetTab.rows, fieldsConfig, 10);

  for (const result of results) {
    const { data, errors, warnings } = result;

    const title = createMovie(data as any); // TODO put tye: as Partial<Movie>

    if (!title.directors || !title.directors.length) errors.push({
      type: 'error',
      field: 'directors',
      name: 'Missing Director(s)',
      reason: 'You need to fill at least one Director',
      hint: 'Please edit the corresponding sheets field'
    });

    // ! REQUIRED
    // TODO ORG IDS

    // TODO issue#6929
    titles.push({ errors: [ ...errors, ...warnings ],  movie: title });
  }

  return titles;
}
