import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MovieService, createMovie } from '@blockframes/movie/+state';
import { extract, SheetTab, ValueWithWarning } from '@blockframes/utils/spreadsheet';
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
  formatNumber,
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

const fieldsConfig = {
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

type FieldsType = keyof typeof fieldsConfig;
type GetValue<T> = T extends ValueWithWarning ? T["value"] : T
type ImportType = { [key in FieldsType]: GetValue<ReturnType<typeof fieldsConfig[key]>> }


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

  private mapping = {} as ImportType;

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

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();

    let i = 0;
    this.currentRows = sheetTab.rows.slice(i, i + this.dedicatedLinesPerTitle);

    while (this.currentRows.length) {
      const { data, errors, warnings } = extract<ImportType>(this.currentRows, fieldsConfig)
      this.mapping = data;
      if (!this.mapping.title.original) { break; }

      // Fetch movie from internalRef if set or create a new movie
      let movie = createMovie();
      if (this.mapping.internalRef) {
        try {
          const _movie = await this.movieService.getFromInternalRef(this.mapping.internalRef, !this.isUserBlockframesAdmin ? this.authQuery.user.orgId : undefined);
          if (_movie) { movie = _movie };
        } catch (e) { console.error(e) }
      }
      const importErrors = { movie, errors: warnings } as MovieImportState;

      // TITLE
      if (this.mapping.title) {
        movie.title = this.mapping.title;
      }

      // INTERNAL REF (Film Code)
      if (this.mapping.internalRef) {
        movie.internalRef = this.mapping.internalRef;
      }

      if (this.mapping.episodeCount) {
        movie.runningTime.episodeCount = this.mapping.episodeCount;
      }

      // WORK TYPE
      formatContentType(this.mapping.contentType, movie, importErrors);

      // DIRECTORS
      movie.directors = formatCredits(this.mapping.directors);

      // ORIGIN COUNTRIES (Countries of Origin)
      movie.originCountries = formatOriginCountries(this.mapping.originCountries, importErrors);

      // PRODUCTION STATUS
      formatProductionStatus(this.mapping.productionStatus, movie, importErrors);

      // RELEASE YEAR
      if (!isNaN(this.mapping.releaseYear)) {
        formatReleaseYear(this.mapping.releaseYear, this.mapping.releaseYearStatus, movie);
      } else {
        formatSingleValue(this.mapping.releaseYearStatus, 'screeningStatus', 'movie.release.status', movie);
      }

      // PRODUCTION COMPANIES (Production Companie(s))
      formatStakeholders(this.mapping.stakeholders, movie, importErrors);

      // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
      movie.originalRelease = formatOriginalRelease(this.mapping.originalRelease, importErrors);

      // LANGUAGES (Original Language(s))
      movie.originalLanguages = formatOriginalLanguages(this.mapping.originalLanguages, importErrors);

      // GENRES (Genres)
      formatGenres(this.mapping.genres, this.mapping.customGenres, movie, importErrors);

      // RUNNING TIME (Total Run Time)
      formatRunningTime(this.mapping.runningTime, this.mapping.runningTimeStatus, movie);

      // CREDITS (Principal Cast)
      movie.cast = formatCredits(this.mapping.cast, 'memberStatus');

      // PRIZES (Prizes)
      formatPrizes(this.mapping.prizes, movie);

      // SYNOPSIS (Synopsis)
      movie.synopsis = this.mapping.synopsis;

      // KEY ASSETS (Key Assets)
      movie.keyAssets = this.mapping.keyAssets;

      // KEYWORDS
      movie.keywords = this.mapping.keywords;

      // PRODUCERS
      movie.producers = formatCredits(this.mapping.producers, 'producerRoles') as Producer[];

      // CREW
      movie.crew = formatCredits(this.mapping.crew, 'crewRoles') as Crew[];

      // BUDGET RANGE
      formatSingleValue(this.mapping.budgetRange, 'budgetRange', 'estimatedBudget', movie);

      // BOX OFFICE
      movie.boxOffice = formatBoxOffice(this.mapping.boxoffice, importErrors);

      // QUALIFICATIONS (certifications)
      movie.certifications = formatCertifications(this.mapping.certifications, importErrors);

      // RATINGS
      movie.rating = formatRatings(this.mapping.ratings, importErrors);

      // FILM REVIEW
      movie.review = formatReview(this.mapping.reviews);

      // COLOR
      formatSingleValue(this.mapping.color, 'colors', 'color', movie);

      // FORMAT
      formatSingleValue(this.mapping.format, 'movieFormat', 'format', movie);

      // FORMAT QUALITY
      formatSingleValue(this.mapping.formatQuality, 'movieFormatQuality', 'formatQuality', movie);

      // SOUND QUALITY
      formatSingleValue(this.mapping.soundFormat, 'soundFormat', 'soundFormat', movie);

      // ORIGINAL VERSION
      movie.isOriginalVersionAvailable = this.mapping.isOriginalVersionAvailable.toLowerCase() === 'yes' ? true : false;

      // LANGUAGES (Available versions(s))
      formatAvailableLanguages(this.mapping.languages, movie, importErrors);

      // LOGLINE (Logline)
      movie.logline = this.mapping.logline;

      // POSITIONING (Positioning)
      movie.audience = formatAudienceGoals(this.mapping.audience);

      // SALES PITCH (Description)
      movie.promotional.salesPitch.description = this.mapping.salesPitch;

      //////////////////
      // ADMIN FIELDS
      //////////////////

      let statusSetAsBlockframesAdmin = false;
      if (this.isUserBlockframesAdmin) {

        /**
       * MOVIE APP ACCESS
       * For each app, we set a status. If there is no status registered, it will be draft by default.
       */
        // CATALOG STATUS
        formatSingleValue(this.mapping.catalogStatus, 'storeStatus', `app.catalog.status`, movie);
        if (this.mapping.catalogStatus) {
          movie.app.catalog.access = true;
          statusSetAsBlockframesAdmin = true;
        }

        // FESTIVAL STATUS
        formatSingleValue(this.mapping.festivalStatus, 'storeStatus', `app.festival.status`, movie);
        if (this.mapping.festivalStatus) {
          movie.app.festival.access = true;
          statusSetAsBlockframesAdmin = true;
        }

        // FINANCIERS STATUS
        formatSingleValue(this.mapping.financiersStatus, 'storeStatus', `app.financiers.status`, movie);
        if (this.mapping.financiersStatus) {
          movie.app.financiers.access = true;
          statusSetAsBlockframesAdmin = true;
        }

        // USER ID (to override who is creating this title)
        if (this.mapping.ownerId) {
          movie._meta = createDocumentMeta();
          const user = await this.userService.getUser(this.mapping.ownerId);
          if (user && user.orgId) {
            movie._meta.createdBy = user.uid;
            movie.orgIds = [user.orgId];
          } else {
            importErrors.errors.push({
              type: 'error',
              field: 'movie._meta.createdBy',
              name: 'Movie owned id',
              reason: `User Id specified for movie admin does not exists or does not have an org "${this.mapping.ownerId}"`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        }
      }

      if (!statusSetAsBlockframesAdmin) {
        const currentApp = getCurrentApp(this.router);
        movie.app[currentApp].access = true;
      }

      ///////////////
      // VALIDATION
      ///////////////

      const movieWithErrors = this.validateMovie(importErrors);
      if (movieWithErrors.movie.id) {
        this.moviesToUpdate.data.push(movieWithErrors);
        this.moviesToUpdate.data = [... this.moviesToUpdate.data];
      } else {
        this.moviesToCreate.data.push(movieWithErrors);
        this.moviesToCreate.data = [... this.moviesToCreate.data];
      }
      this.cdRef.markForCheck();

      i += this.currentRows.length;
      this.currentRows = sheetTab.rows.slice(i, i + this.dedicatedLinesPerTitle);
    }
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
