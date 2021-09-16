import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MovieService, createMovie } from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { Crew, Producer } from '@blockframes/utils/common-interfaces/identity';
import { Intercom } from 'ng-intercom';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import {
  formatAudienceGoals,
  formatAvailableLanguages,
  formatBoxOffice,
  formatCertifications,
  formatContentType,
  formatCredits,
  formatGenres,
  formatOriginalLanguages,
  formatOriginalRelease,
  formatOriginCountries,
  formatPrizes,
  formatProductionStatus,
  formatRatings,
  formatReleaseYear,
  formatReview,
  formatRunningTime,
  formatSingleValue,
  formatStakeholders
} from '@blockframes/utils/spreadsheet/format';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { MovieImportState } from '../../../import-utils';
import { createDocumentMeta } from '@blockframes/utils/models-meta';
import { UserService } from '@blockframes/user/+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';

let index = 0;
/**
 * Comments "// LETTER(S)" refers to the column index in the spreadsheet file
 */
const fields = {
  internationalTitle: { // A
    multiLine: false,
    index: index++
  },
  originalTitle: { // B
    multiLine: false,
    index: index++
  },
  internalRef: { // C
    multiLine: false,
    index: index++
  },
  contentType: { // D
    multiLine: false,
    index: index++
  },
  series: { // E
    multiLine: false,
    index: index++
  },
  episodeCount: { // F
    multiLine: false,
    index: index++
  },
  productionStatus: { // G
    multiLine: false,
    index: index++
  },
  releaseYear: { // H
    multiLine: false,
    index: index++
  },
  releaseYearStatus: { // I
    multiLine: false,
    index: index++
  },
  directors: {
    multiLine: true,
    fields: {
      firstName: index++, // J
      lastName: index++, // K
      description: index++, // L
    }
  },
  originCountries: { // M
    multiLine: true,
    index: index++
  },
  stakeholders: {
    multiLine: true,
    fields: {
      displayName: index++, // N
      role: index++, // O
      country: index++, // P
    }
  },
  originalRelease: {
    multiLine: true,
    fields: {
      country: index++, // Q
      media: index++, // R
      date: index++, // S
    }
  },
  originalLanguages: { // T
    multiLine: true,
    index: index++
  },
  genres: { // U
    multiLine: true,
    index: index++
  },
  customGenres: { // V
    multiLine: true,
    index: index++
  },
  runningTime: { // W
    multiLine: false,
    index: index++
  },
  runningTimeStatus: { // X
    multiLine: false,
    index: index++
  },
  cast: {
    multiLine: true,
    fields: {
      firstName: index++, // Y
      lastName: index++, // A
      status: index++, // AA
    }
  },
  prizes: {
    multiLine: true,
    fields: {
      name: index++, // AB
      year: index++, // AC
      prize: index++, // AD
      premiere: index++, // AE
    }
  },
  logline: { // AF
    multiLine: false,
    index: index++
  },
  synopsis: { // AG
    multiLine: false,
    index: index++
  },
  keyAssets: { // AH
    multiLine: false,
    index: index++
  },
  keywords: { // AI
    multiLine: true,
    index: index++
  },
  producers: {
    multiLine: true,
    fields: {
      firstName: index++, // AJ
      lastName: index++, // AK
      role: index++, // AL
    }
  },
  crew: {
    multiLine: true,
    fields: {
      firstName: index++, // AM
      lastName: index++, // AN
      role: index++, // AO
    }
  },
  budgetRange: { // AP
    multiLine: false,
    index: index++
  },
  boxoffice: {
    multiLine: true,
    fields: {
      territory: index++, // AQ
      unit: index++, // AR
      value: index++, // AS
    }
  },
  certifications: { // AT
    multiLine: true,
    index: index++
  },
  ratings: {
    multiLine: true,
    fields: {
      country: index++, // AU
      value: index++, // AV
    }
  },
  audience: {
    multiLine: true,
    fields: {
      targets: index++, // AW
      goals: index++ // AX
    }
  },
  reviews: {
    multiLine: true,
    fields: {
      filmCriticName: index++, // AY
      revue: index++, // AZ
      link: index++, // BA
      quote: index++, // BB
    }
  },
  color: { // BC
    multiLine: false,
    index: index++
  },
  format: { // BD
    multiLine: false,
    index: index++
  },
  formatQuality: { // BE
    multiLine: false,
    index: index++
  },
  soundFormat: { // BF
    multiLine: false,
    index: index++
  },
  isOriginalVersionAvailable: { // BG
    multiLine: false,
    index: index++
  },
  languages: {
    multiLine: true,
    fields: {
      language: index++, // BH
      dubbed: index++, // BI
      subtitle: index++, // BJ
      caption: index++, // BK
    }
  },
  salesPitch: { // BL
    multiLine: false,
    index: index++
  },
  //////////////////
  // ADMIN FIELDS
  //////////////////
  catalogStatus: { // BM
    multiLine: false,
    index: index++
  },
  festivalStatus: { // BN
    multiLine: false,
    index: index++
  },
  financiersStatus: { // BO
    multiLine: false,
    index: index++
  },
  ownerId: { // BP
    multiLine: false,
    index: index++
  },
};

type fieldsKey = keyof typeof fields;
type ParseFieldFn = (value: string | string[], state: any, rowIndex?: number) => any;
/**
* item: The current object to return (contract, movie, org, ...)
* value: value of the cell (array of string if the cell has several lines)
* path: The key in the transform object (without the column segment)
* transform: the callback of the key
*/
function parse(item: any = {}, values: string | string[], path: string, transform: ParseFieldFn, rowIndex: number) {
  // Here we assume the column section has already been removed from the path
  const segments = path.split('.');
  const [segment, ...remainingSegments] = segments;
  const last = !remainingSegments?.length;
  if (segment.endsWith('[]')) {
    const field = segment.replace('[]', '');
    if (Array.isArray(values)) {
      // console.log({values, transform:transform(values[0], item, rowIndex)})
      if (last) item[field] = values.map((value, index) => transform(value, item, index));
      if (!last) item[field] = values.map((value,index) => parse(item[field] || {}, value, segments.join('.'), transform, rowIndex));
    }
  } else {
    if (last) item[segment] = transform(values, item);
    if (!last) item[segment] = parse(item[segment] || {}, values, segments.join('.'), transform, rowIndex);
  }
}

@Component({
  selector: 'import-view-extracted-movies',
  templateUrl: './view-extracted-movies.component.html',
  styleUrls: ['./view-extracted-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedMoviesComponent implements OnInit {

  public moviesToCreate = new MatTableDataSource<MovieImportState>();
  public moviesToUpdate = new MatTableDataSource<MovieImportState>();

  public dedicatedLinesPerTitle = 10;

  public isUserBlockframesAdmin = false;

  public currentRows = [];

  private mapping = {} as Record<fieldsKey, any>;

  constructor(
    @Optional() private intercom: Intercom,
    private movieService: MovieService,
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private dynTitle: DynamicTitleService,
    private userService: UserService,
    private router: RouterQuery
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }


  extract(rawRows: string[][], extractParams: Record<string, ParseFieldFn> = {}) {
    let extraParamsEntries = Object.entries(extractParams);
    const state = {};
    extraParamsEntries = extraParamsEntries.sort(([keyA], [keyB]) => keyA.split('_')[0] > keyB.split('_')[0] ? 1 : -1);
    extraParamsEntries.forEach(([columnIndexedKey, parseFieldFn], index) => {
      const combinedKeys = columnIndexedKey.split('_').pop();
      const extraParamValue = rawRows.map(row => row[index] ?? '');
      parse(state, extraParamValue, combinedKeys, parseFieldFn, index)
      // if (!combinedKeys.includes('.')) {
      //   state[combinedKeys] = extraParamValue;
      // } else {
      //   const keys = combinedKeys.split('.')
      //   keys.forEach(keySymbol => {
      //     if (keySymbol.endsWith('[]')) {
      //       const key = keySymbol.substring(0, keySymbol.length - 1);
      //       if (!state[key]) {
      //         state[key] = []
      //       }
      //     } else { }
      //   })
      // }


    });
    return state
  }


  public async format(sheetTab: SheetTab) {
    this.clearDataSources();

    let i = 0;
    this.currentRows = sheetTab.rows.slice(i, i + this.dedicatedLinesPerTitle);

    while (this.currentRows.length) {
      const returnValue = this.extract(this.currentRows, {
        'a_internationalTitle': ([value]: string[],) => value,
        'b_originalTitle': ([value]: string[],) => value,
        'c_internalRef': ([value]: string[],) => value,
        'd_contentType': ([value]: string[],) => value,
        'e_series': ([value]: string[],) => value,
        'f_episodeCount': ([value]: string[],) => value,
        'g_productionStatus': ([value]: string[],) => value,
        'h_releaseYear': ([value]: string[],) => value,
        'i_releaseYearStatus': ([value]: string[],) => value,
        // 'c_internalRef': ([value]: string[],) => value,
        'j_directors[].firstName': (rows: string[], state, rowIndex) => {
          return rows[rowIndex];
        },
        'k_directors[].lastName': (rows: string[], state, rowIndex) => {
          return rows[rowIndex];
        },
        'l_directors[].description': (rows: string[], state, rowIndex) => {
          return rows[rowIndex];
        },
        // 'a_internationalTitle': ([value]: string[], state, rowIndex) => {
        //   return value
        // },
      })

      // 'y_directors[].firstName': (value: string[], rowIndex: number) => {
      //   return (director, index) => director.firstName = value[index];
      // }

      i += this.currentRows.length;
      this.currentRows = sheetTab.rows.slice(i, i + this.dedicatedLinesPerTitle);
      console.log({ returnValue });
    }



    // while (this.currentRows.length) {
    //   Object.keys(fields).forEach(k => {
    //     this.mapping[k] = this.getFieldContent(fields[k]);
    //   })

    //   if (!this.mapping.originalTitle) { break; }

    //   // Fetch movie from internalRef if set or create a new movie
    //   let movie = createMovie();
    //   if (this.mapping.internalRef) {
    //     try {
    //       const _movie = await this.movieService.getFromInternalRef(this.mapping.internalRef, !this.isUserBlockframesAdmin ? this.authQuery.user.orgId : undefined);
    //       if (_movie) { movie = _movie };
    //     } catch (e) { console.log(e) }
    //   }
    //   const importErrors = { movie, errors: [] } as MovieImportState;

    //   // ORIGINAL TITLE (Original Title)
    //   movie.title.original = this.mapping.originalTitle;

    //   // INTERNATIONAL TITLE (International Title)
    //   if (this.mapping.internationalTitle) {
    //     movie.title.international = this.mapping.internationalTitle;
    //   }

    //   // INTERNAL REF (Film Code)
    //   if (this.mapping.internalRef) {
    //     movie.internalRef = this.mapping.internalRef;
    //   }

    //   if (this.mapping.series) {
    //     movie.title.series = parseInt(this.mapping.series, 10);
    //   }

    //   if (this.mapping.episodeCount) {
    //     movie.runningTime.episodeCount = parseInt(this.mapping.episodeCount, 10);
    //   }

    //   // WORK TYPE
    //   formatContentType(this.mapping.contentType, movie, importErrors);

    //   // DIRECTORS
    //   movie.directors = formatCredits(this.mapping.directors);

    //   // ORIGIN COUNTRIES (Countries of Origin)
    //   movie.originCountries = formatOriginCountries(this.mapping.originCountries, importErrors);

    //   // PRODUCTION STATUS
    //   formatProductionStatus(this.mapping.productionStatus, movie, importErrors);

    //   // RELEASE YEAR
    //   if (!isNaN(this.mapping.releaseYear)) {
    //     formatReleaseYear(this.mapping.releaseYear, this.mapping.releaseYearStatus, movie);
    //   } else {
    //     formatSingleValue(this.mapping.releaseYearStatus, 'screeningStatus', 'movie.release.status', movie);
    //   }

    //   // PRODUCTION COMPANIES (Production Companie(s))
    //   formatStakeholders(this.mapping.stakeholders, movie, importErrors);

    //   // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
    //   movie.originalRelease = formatOriginalRelease(this.mapping.originalRelease, importErrors);

    //   // LANGUAGES (Original Language(s))
    //   movie.originalLanguages = formatOriginalLanguages(this.mapping.originalLanguages, importErrors);

    //   // GENRES (Genres)
    //   formatGenres(this.mapping.genres, this.mapping.customGenres, movie, importErrors);

    //   // RUNNING TIME (Total Run Time)
    //   formatRunningTime(this.mapping.runningTime, this.mapping.runningTimeStatus, movie);

    //   // CREDITS (Principal Cast)
    //   movie.cast = formatCredits(this.mapping.cast, 'memberStatus');

    //   // PRIZES (Prizes)
    //   formatPrizes(this.mapping.prizes, movie);

    //   // SYNOPSIS (Synopsis)
    //   movie.synopsis = this.mapping.synopsis;

    //   // KEY ASSETS (Key Assets)
    //   movie.keyAssets = this.mapping.keyAssets;

    //   // KEYWORDS
    //   movie.keywords = this.mapping.keywords;

    //   // PRODUCERS
    //   movie.producers = formatCredits(this.mapping.producers, 'producerRoles') as Producer[];

    //   // CREW
    //   movie.crew = formatCredits(this.mapping.crew, 'crewRoles') as Crew[];

    //   // BUDGET RANGE
    //   formatSingleValue(this.mapping.budgetRange, 'budgetRange', 'estimatedBudget', movie);

    //   // BOX OFFICE
    //   movie.boxOffice = formatBoxOffice(this.mapping.boxoffice, importErrors);

    //   // QUALIFICATIONS (certifications)
    //   movie.certifications = formatCertifications(this.mapping.certifications, importErrors);

    //   // RATINGS
    //   movie.rating = formatRatings(this.mapping.ratings, importErrors);

    //   // FILM REVIEW
    //   movie.review = formatReview(this.mapping.reviews);

    //   // COLOR
    //   formatSingleValue(this.mapping.color, 'colors', 'color', movie);

    //   // FORMAT
    //   formatSingleValue(this.mapping.format, 'movieFormat', 'format', movie);

    //   // FORMAT QUALITY
    //   formatSingleValue(this.mapping.formatQuality, 'movieFormatQuality', 'formatQuality', movie);

    //   // SOUND QUALITY
    //   formatSingleValue(this.mapping.soundFormat, 'soundFormat', 'soundFormat', movie);

    //   // ORIGINAL VERSION
    //   movie.isOriginalVersionAvailable = this.mapping.isOriginalVersionAvailable.toLowerCase() === 'yes' ? true : false;

    //   // LANGUAGES (Available versions(s))
    //   formatAvailableLanguages(this.mapping.languages, movie, importErrors);

    //   // LOGLINE (Logline)
    //   movie.logline = this.mapping.logline;

    //   // POSITIONING (Positioning)
    //   movie.audience = formatAudienceGoals(this.mapping.audience);

    //   // SALES PITCH (Description)
    //   movie.promotional.salesPitch.description = this.mapping.salesPitch;

    //   //////////////////
    //   // ADMIN FIELDS
    //   //////////////////

    //   let statusSetAsBlockframesAdmin = false;
    //   if (this.isUserBlockframesAdmin) {

    //     /**
    //    * MOVIE APP ACCESS
    //    * For each app, we set a status. If there is no status registered, it will be draft by default.
    //    */
    //     // CATALOG STATUS
    //     formatSingleValue(this.mapping.catalogStatus, 'storeStatus', `app.catalog.status`, movie);
    //     if (this.mapping.catalogStatus) {
    //       movie.app.catalog.access = true;
    //       statusSetAsBlockframesAdmin = true;
    //     }

    //     // FESTIVAL STATUS
    //     formatSingleValue(this.mapping.festivalStatus, 'storeStatus', `app.festival.status`, movie);
    //     if (this.mapping.festivalStatus) {
    //       movie.app.festival.access = true;
    //       statusSetAsBlockframesAdmin = true;
    //     }

    //     // FINANCIERS STATUS
    //     formatSingleValue(this.mapping.financiersStatus, 'storeStatus', `app.financiers.status`, movie);
    //     if (this.mapping.financiersStatus) {
    //       movie.app.financiers.access = true;
    //       statusSetAsBlockframesAdmin = true;
    //     }

    //     // USER ID (to override who is creating this title)
    //     if (this.mapping.ownerId) {
    //       movie._meta = createDocumentMeta();
    //       const user = await this.userService.getUser(this.mapping.ownerId);
    //       if (user && user.orgId) {
    //         movie._meta.createdBy = user.uid;
    //         movie.orgIds = [user.orgId];
    //       } else {
    //         importErrors.errors.push({
    //           type: 'error',
    //           field: 'movie._meta.createdBy',
    //           name: 'Movie owned id',
    //           reason: `User Id specified for movie admin does not exists or does not have an org "${this.mapping.ownerId}"`,
    //           hint: 'Edit corresponding sheet field.'
    //         });
    //       }
    //     }
    //   }

    //   if (!statusSetAsBlockframesAdmin) {
    //     const currentApp = getCurrentApp(this.router);
    //     movie.app[currentApp].access = true;
    //   }

    //   ///////////////
    //   // VALIDATION
    //   ///////////////

    //   const movieWithErrors = this.validateMovie(importErrors);
    //   if (movieWithErrors.movie.id) {
    //     this.moviesToUpdate.data.push(movieWithErrors);
    //     this.moviesToUpdate.data = [... this.moviesToUpdate.data];
    //   } else {
    //     this.moviesToCreate.data.push(movieWithErrors);
    //     this.moviesToCreate.data = [... this.moviesToCreate.data];
    //   }
    //   this.cdRef.markForCheck();

    //   i += this.currentRows.length;
    //   this.currentRows = sheetTab.rows.slice(i, i + this.dedicatedLinesPerTitle);
    // }
  }

  private validateMovie(importErrors: MovieImportState): MovieImportState {
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

  public openIntercom(): void {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
  }

  private getFieldContent(fieldConfig: any) {
    if (this.currentRows.length) {
      const value = this.currentRows[0][fieldConfig.index];
      if (value) {
        return isNaN(value) ? value.trim() : value.toString();
      } else {
        return '';
      }
    } else { return ''; }
  }

  private getFieldContentMultilineFields(fieldConfig: any) {
    return this.currentRows.map(r => {
      const obj = {};
      Object.keys(fieldConfig.fields).forEach(k => {
        const value = r[fieldConfig.fields[k]];
        if (value) {
          obj[k] = isNaN(value) ? value.trim() : value.toString();
        } else {
          obj[k] = '';
        }
      });
      return obj;
    })

  }

  private getFieldContentMultiline(fieldConfig: any) {
    return this.currentRows.map(r => {
      const value = r[fieldConfig.index];
      if (value) {
        return isNaN(value) ? value.trim() : value.toString();
      } else {
        return '';
      }
    }).filter(m => !!m);
  }
}
