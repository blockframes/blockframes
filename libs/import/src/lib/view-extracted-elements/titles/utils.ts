
import { App } from '@blockframes/utils/apps';
import { UserService } from '@blockframes/user/+state';
import { MovieImportState } from '@blockframes/import/utils';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { createMovie, MovieService } from '@blockframes/movie/+state';
import { Crew, Producer } from '@blockframes/utils/common-interfaces';
import { extract, ExtractConfig, SheetTab } from '@blockframes/utils/spreadsheet';
import {
  formatContentType,
  formatCredits,
  formatNumber,
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

interface FieldsConfig {
  title: {
    international: string,
    original: string,
    series: number | string,
  },
  internalRef: string,
  contentType: string,
  episodeCount: number,
  productionStatus: string,
  releaseYear: string,
  releaseYearStatus: string,
  directors: {
    firstName: string, lastName: string,
    description: string
  }[],
  originCountries: string[],
  stakeholders: {
    displayName: string, role: string,
    country:string,
  }[],
  originalRelease: {
    country: string, media: string,
    date: string
  }[],
  originalLanguages: string[],
  genres: string[],
  customGenres: string[],
  runningTime: string,
  runningTimeStatus: string,
  cast: {
    firstName: string, lastName: string, status: string
  }[],
  prizes: {
    name: string, year: string,
    prize: string, premiere: string,
  }[],
  logline: string,
  synopsis: string,
  keyAssets: string,
  keywords: string[],
  producers: {
    firstName: string, lastName: string, role: string
  }[],
  crew: {
    firstName: string, lastName: string, role: string
  }[],
  budgetRange: string,
  boxoffice: {
    territory: string, unit: string, value: string
  }[],
  certifications: string[],
  ratings: { country: string, value: string, }[],
  audience: { targets: string, goals: string, }[],
  reviews: {
    filmCriticName: string, revue: string,
    link: string, quote: string,
  }[],
  color: string,
  format: string,
  formatQuality: string,
  soundFormat: string,
  isOriginalVersionAvailable: string,
  languages: {
    language: string, dubbed: string,
    subtitle: string, caption: string,
  }[],
  salesPitch: string,
  catalogStatus: string,
  festivalStatus: string,
  financiersStatus: string,
  ownerId: string,
}

type FieldsConfigType = ExtractConfig<FieldsConfig>;


export const fieldsConfig: FieldsConfigType = {
  /* a */ 'title.international': (value: string) => value,
  /* b */ 'title.original': (value: string) => value,
  /* c */ 'internalRef': (value: string) => value,
  /* d */ 'contentType': (value: string) => value,
  /* e */ 'title.series': (value: string) => {
    if (value && !isNaN(formatNumber(value))) {
      return formatNumber(value);
    }
    return value
  },
  /* f */ 'episodeCount': (value: string) => {
    return parseInt(value, 10);
  },
  /* g */ 'productionStatus': (value: string) => value,
  /* h */ 'releaseYear': (value: string) => value,
  /* i */ 'releaseYearStatus': (value: string) => value,
  /* j */ 'directors[].firstName': (value: string) => value,
  /* k */ 'directors[].lastName': (value: string) => value,
  /* l */ 'directors[].description': (value: string) => value,
  /* m */ 'originCountries[]': (value: string) => value,
  /* n */ 'stakeholders[].displayName': (value: string) => value,
  /* o */ 'stakeholders[].role': (value: string) => value,
  /* p */ 'stakeholders[].country': (value: string) => value,
  /* q */ 'originalRelease[].country': (value: string) => value,
  /* r */ 'originalRelease[].media': (value: string) => value,
  /* s */ 'originalRelease[].date': (value: string) => value,
  /* t */ 'originalLanguages[]': (value: string) => value,
  /* u */ 'genres[]': (value: string) => value,
  /* v */ 'customGenres[]': (value: string) => value,
  /* w */ 'runningTime': (value: string) => value,
  /* x */ 'runningTimeStatus': (value: string) => value,
  /* y */ 'cast[].firstName': (value: string) => value,
  /* z */ 'cast[].lastName': (value: string) => value,
  /* aa */ 'cast[].status': (value: string) => value,
  /* ab */ 'prizes[].name': (value: string) => value,
  /* ac */ 'prizes[].year': (value: string) => value,
  /* ad */ 'prizes[].prize': (value: string) => value,
  /* ae */ 'prizes[].premiere': (value: string) => value,
  /* af */ 'logline': (value: string) => value,
  /* ag */ 'synopsis': (value: string) => value,
  /* ah */ 'keyAssets': (value: string) => value,
  /* ai */ 'keywords[]': (value: string) => value,
  /* aj */ 'producers[].firstName': (value: string) => value,
  /* ak */ 'producers[].lastName': (value: string) => value,
  /* al */ 'producers[].role': (value: string) => value,
  /* am */ 'crew[].firstName': (value: string) => value,
  /* an */ 'crew[].lastName': (value: string) => value,
  /* ao */ 'crew[].role': (value: string) => value,
  /* ap */ 'budgetRange': (value: string) => value,
  /* aq */ 'boxoffice[].territory': (value: string) => value,
  /* ar */ 'boxoffice[].unit': (value: string) => value,
  /* as */ 'boxoffice[].value': (value: string) => value,
  /* at */ 'certifications[]': (value: string) => value,
  /* au */ 'ratings[].country': (value: string) => value,
  /* av */ 'ratings[].value': (value: string) => value,
  /* aw */ 'audience[].targets': (value: string) => value,
  /* ax */ 'audience[].goals': (value: string) => value,
  /* ay */ 'reviews[].filmCriticName': (value: string) => value,
  /* az */ 'reviews[].revue': (value: string) => value,
  /* ba */ 'reviews[].link': (value: string) => value,
  /* bb */ 'reviews[].quote': (value: string) => value,
  /* bc */ 'color': (value: string) => value,
  /* bd */ 'format': (value: string) => value,
  /* be */ 'formatQuality': (value: string) => value,
  /* bf */ 'soundFormat': (value: string) => value,
  /* bg */ 'isOriginalVersionAvailable': (value: string) => value,
  /* bh */ 'languages[].language': (value: string) => value,
  /* bi */ 'languages[].dubbed': (value: string) => value,
  /* bj */ 'languages[].subtitle': (value: string) => value,
  /* bk */ 'languages[].caption': (value: string) => value,
  /* bl */ 'salesPitch': (value: string) => value,
  /* bm */ 'catalogStatus': (value: string) => value,
  /* bn */ 'festivalStatus': (value: string) => value,
  /* bo */ 'financiersStatus': (value: string) => value,
  /* bp */ 'ownerId': (value: string) => value,
};

function validateMovie(importErrors: MovieImportState): MovieImportState {
  const movie = importErrors.movie;
  const errors = importErrors.errors;
  //////////////////
  // REQUIRED FIELDS
  //////////////////

  if (!movie.title.original) {
    errors.push({
      type: 'error',
      field: 'movie.title.original',
      name: 'Original title',
      reason: 'Required field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (movie.directors.length === 0) {
    errors.push({
      type: 'error',
      field: 'movie.directors',
      name: 'Directors',
      reason: 'Required field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  //////////////////
  // OPTIONAL FIELDS
  //////////////////

  if (!movie.internalRef) {
    errors.push({
      type: 'warning',
      field: 'movie.internalRef',
      name: 'Film Code ',
      reason: 'Required field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  if (!movie.title.international) {
    errors.push({
      type: 'warning',
      field: 'movie.title.international',
      name: 'International title',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

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

  if (!movie.promotional.salesPitch.description) {
    errors.push({
      type: 'warning',
      field: 'movie.promotional.salesPitch',
      name: 'Sales Pitch',
      reason: 'Optional field is missing',
      hint: 'Edit corresponding sheet field.'
    });
  }

  return importErrors;
}

export async function formatTitle(sheetTab: SheetTab, movieService: MovieService, userService: UserService, blockframesAdmin: boolean, currentApp: App, orgId?: string) {
  const moviesToCreate: any[] = [];
  const moviesToUpdate: any[] = [];

  const dedicatedLinesPerTitle = 10;

  let i = 0;
  let currentRows = sheetTab.rows.slice(i, i + dedicatedLinesPerTitle);

  while (currentRows.length) {
    const { data, warnings } = extract<any>(currentRows, fieldsConfig)
    if (!data.title.original) { break; }
    // Fetch movie from internalRef if set or create a new movie
    let movie = createMovie();
    if (data.internalRef) {
      try {
        const _movie = await movieService.getFromInternalRef(data.internalRef, orgId);
        if (_movie) { movie = _movie };
      } catch (e) { console.error(e) }
    }
    const importErrors = { movie, errors: warnings } as MovieImportState;

    // TITLE
    if (data.title) {
      movie.title = data.title;
    }

    // INTERNAL REF (Film Code)
    if (data.internalRef) {
      movie.internalRef = data.internalRef;
    }

    if (data.episodeCount) {
      movie.runningTime.episodeCount = data.episodeCount;
    }

    // WORK TYPE
    formatContentType(data.contentType, movie, importErrors);

    // DIRECTORS
    movie.directors = formatCredits(data.directors);

    // ORIGIN COUNTRIES (Countries of Origin)
    movie.originCountries = formatOriginCountries(data.originCountries, importErrors);

    // PRODUCTION STATUS
    formatProductionStatus(data.productionStatus, movie, importErrors);

    // RELEASE YEAR
    if (!isNaN(data.releaseYear)) {
      formatReleaseYear(data.releaseYear, data.releaseYearStatus, movie);
    } else {
      formatSingleValue(data.releaseYearStatus, 'screeningStatus', 'movie.release.status', movie);
    }

    // PRODUCTION COMPANIES (Production Companie(s))
    formatStakeholders(data.stakeholders, movie, importErrors);

    // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
    movie.originalRelease = formatOriginalRelease(data.originalRelease, importErrors);

    // LANGUAGES (Original Language(s))
    movie.originalLanguages = formatOriginalLanguages(data.originalLanguages, importErrors);

    // GENRES (Genres)
    formatGenres(data.genres, data.customGenres, movie, importErrors);

    // RUNNING TIME (Total Run Time)
    formatRunningTime(data.runningTime, data.runningTimeStatus, movie);

    // CREDITS (Principal Cast)
    movie.cast = formatCredits(data.cast, 'memberStatus');

    // PRIZES (Prizes)
    formatPrizes(data.prizes, movie);

    // SYNOPSIS (Synopsis)
    movie.synopsis = data.synopsis;

    // KEY ASSETS (Key Assets)
    movie.keyAssets = data.keyAssets;

    // KEYWORDS
    movie.keywords = data.keywords;

    // PRODUCERS
    movie.producers = formatCredits(data.producers, 'producerRoles') as Producer[];

    // CREW
    movie.crew = formatCredits(data.crew, 'crewRoles') as Crew[];

    // BUDGET RANGE
    formatSingleValue(data.budgetRange, 'budgetRange', 'estimatedBudget', movie);

    // BOX OFFICE
    movie.boxOffice = formatBoxOffice(data.boxoffice, importErrors);

    // QUALIFICATIONS (certifications)
    movie.certifications = formatCertifications(data.certifications, importErrors);

    // RATINGS
    movie.rating = formatRatings(data.ratings, importErrors);

    // FILM REVIEW
    movie.review = formatReview(data.reviews);

    // COLOR
    formatSingleValue(data.color, 'colors', 'color', movie);

    // FORMAT
    formatSingleValue(data.format, 'movieFormat', 'format', movie);

    // FORMAT QUALITY
    formatSingleValue(data.formatQuality, 'movieFormatQuality', 'formatQuality', movie);

    // SOUND QUALITY
    formatSingleValue(data.soundFormat, 'soundFormat', 'soundFormat', movie);

    // ORIGINAL VERSION
    movie.isOriginalVersionAvailable = data.isOriginalVersionAvailable.toLowerCase() === 'yes' ? true : false;

    // LANGUAGES (Available versions(s))
    formatAvailableLanguages(data.languages, movie, importErrors);

    // LOGLINE (Logline)
    movie.logline = data.logline;

    // POSITIONING (Positioning)
    movie.audience = formatAudienceGoals(data.audience);

    // SALES PITCH (Description)
    movie.promotional.salesPitch.description = data.salesPitch;

    //////////////////
    // ADMIN FIELDS
    //////////////////

    let statusSetAsBlockframesAdmin = false;
    if (blockframesAdmin) {

      /**
     * MOVIE APP ACCESS
     * For each app, we set a status. If there is no status registered, it will be draft by default.
     */
      // CATALOG STATUS
      formatSingleValue(data.catalogStatus, 'storeStatus', `app.catalog.status`, movie);
      if (data.catalogStatus) {
        movie.app.catalog.access = true;
        statusSetAsBlockframesAdmin = true;
      }

      // FESTIVAL STATUS
      formatSingleValue(data.festivalStatus, 'storeStatus', `app.festival.status`, movie);
      if (data.festivalStatus) {
        movie.app.festival.access = true;
        statusSetAsBlockframesAdmin = true;
      }

      // FINANCIERS STATUS
      formatSingleValue(data.financiersStatus, 'storeStatus', `app.financiers.status`, movie);
      if (data.financiersStatus) {
        movie.app.financiers.access = true;
        statusSetAsBlockframesAdmin = true;
      }

      // USER ID (to override who is creating this title)
      if (data.ownerId) {
        movie._meta = createDocumentMeta();
        const user = await userService.getUser(data.ownerId);
        if (user && user.orgId) {
          movie._meta.createdBy = user.uid;
          movie.orgIds = [user.orgId];
        } else {
          importErrors.errors.push({
            type: 'error',
            field: 'movie._meta.createdBy',
            name: 'Movie owned id',
            reason: `User Id specified for movie admin does not exists or does not have an org "${data.ownerId}"`,
            hint: 'Edit corresponding sheet field.'
          });
        }
      }
    }

    if (!statusSetAsBlockframesAdmin) {
      movie.app[currentApp].access = true;
    }

    ///////////////
    // VALIDATION
    ///////////////

    const movieWithErrors = validateMovie(importErrors);
    if (movieWithErrors.movie.id) {
      moviesToUpdate.push(movieWithErrors);
    } else {
      moviesToCreate.push(movieWithErrors);
    }

    i += currentRows.length;
    currentRows = sheetTab.rows.slice(i, i + dedicatedLinesPerTitle);
  }

  return { moviesToCreate, moviesToUpdate };
}
