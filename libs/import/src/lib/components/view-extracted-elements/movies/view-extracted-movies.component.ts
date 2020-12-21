import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MovieService, createMovie } from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { Crew, Producer } from '@blockframes/utils/common-interfaces/identity';
import { Intercom } from 'ng-intercom';
// import { ImageUploader } from '@blockframes/media/+state/image-uploader.service'; TODO issue #3091
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import {
  formatAvailableLanguages,
  formatBoxOffice,
  formatCertifications,
  formatContentType,
  formatCredits,
  formatDistributionRights,
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

let index = 0;
const fields = {
  internationalTitle: {
    multiLine: false,
    index: index++
  },
  originalTitle: {
    multiLine: false,
    index: index++
  },
  internalRef: {
    multiLine: false,
    index: index++
  },
  contentType: {
    multiLine: false,
    index: index++
  },
  productionStatus: {
    multiLine: false,
    index: index++
  },
  releaseYear: {
    multiLine: false,
    index: index++
  },
  releaseYearStatus: {
    multiLine: false,
    index: index++
  },
  directors: {
    multiLine: true,
    fields: {
      firstName: index++,
      lastName: index++,
      description: index++,
    }
  },
  originCountries: {
    multiLine: true,
    index: index++
  },
  stakeholders: {
    multiLine: true,
    fields: {
      displayName: index++,
      role: index++,
      country: index++,
    }
  },
  originalRelease: {
    multiLine: true,
    fields: {
      country: index++,
      media: index++,
      date: index++,
    }
  },
  originalLanguages: {
    multiLine: true,
    index: index++
  },
  genres: {
    multiLine: true,
    index: index++
  },
  customGenres: {
    multiLine: true,
    index: index++
  },
  runningTime: {
    multiLine: false,
    index: index++
  },
  runningTimeStatus: {
    multiLine: false,
    index: index++
  },
  cast: {
    multiLine: true,
    fields: {
      firstName: index++,
      lastName: index++,
      status: index++,
    }
  },
  prizes: {
    multiLine: true,
    fields: {
      name: index++,
      year: index++,
      prize: index++,
      premiere: index++,
    }
  },
  synopsis: {
    multiLine: false,
    index: index++
  },
  keyAssets: {
    multiLine: false,
    index: index++
  },
  keywords: {
    multiLine: false,
    index: index++
  },
  producers: {
    multiLine: true,
    fields: {
      firstName: index++,
      lastName: index++,
      role: index++,
    }
  },
  crew: {
    multiLine: true,
    fields: {
      firstName: index++,
      lastName: index++,
      role: index++,
    }
  },
  budgetRange: {
    multiLine: false,
    index: index++
  },
  boxoffice: {
    multiLine: true,
    fields: {
      territory: index++,
      unit: index++,
      value: index++,
    }
  },
  certifications: {
    multiLine: true,
    index: index++
  },
  ratings: {
    multiLine: true,
    fields: {
      country: index++,
      value: index++,
    }
  },
  reviews: {
    multiLine: true,
    fields: {
      revue: index++,
      link: index++,
      quote: index++,
    }
  },
  color: {
    multiLine: false,
    index: index++
  },
  format: {
    multiLine: false,
    index: index++
  },
  formatQuality: {
    multiLine: false,
    index: index++
  },
  soundFormat: {
    multiLine: false,
    index: index++
  },
  isOriginalVersionAvailable: {
    multiLine: false,
    index: index++
  },
  languages: {
    multiLine: true,
    fields: {
      language: index++,
      dubbed: index++,
      subtitle: index++,
      caption: index++,
    }
  },
  screenerLink: {
    multiLine: false,
    index: index++
  },
  promoReelLink: {
    multiLine: false,
    index: index++
  },
  trailerLink: {
    multiLine: false,
    index: index++
  },
  pitchTeaserLink: {
    multiLine: false,
    index: index++
  },
  //////////////////
  // FESTIVAL FIELDS
  //////////////////
  territoriesSold: {
    multiLine: false,
    index: index++
  },
  territoriesExcluded: {
    multiLine: false,
    index: index++
  },
  //////////////////
  // ADMIN FIELDS
  //////////////////
  scoring: {
    multiLine: false,
    index: index++
  },
  storeType: {
    multiLine: false,
    index: index++
  },
  storeStatus: {
    multiLine: false,
    index: index++
  },
  ownerId: {
    multiLine: false,
    index: index++
  },
};

type fieldsKey = keyof typeof fields;

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
      Object.keys(fields).forEach(k => {
        this.mapping[k] = this.getFieldContent(fields[k]);
      })

      if (!this.mapping.originalTitle) { break; }

      // Fetch movie from internalRef if set or create a new movie
      let movie = createMovie();
      if (this.mapping.internalRef) {
        const _movie = await this.movieService.getFromInternalRef(this.mapping.internalRef);
        if (_movie) { movie = _movie };
      }
      const importErrors = { movie, errors: [] } as MovieImportState;

      // ORIGINAL TITLE (Original Title)
      movie.title.original = this.mapping.originalTitle;

      // INTERNATIONAL TITLE (International Title)
      if (this.mapping.internationalTitle) {
        movie.title.international = this.mapping.internationalTitle;
      }

      // INTERNAL REF (Film Code)
      if (this.mapping.internalRef) {
        movie.internalRef = this.mapping.internalRef;
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
      formatReleaseYear(this.mapping.releaseYear, this.mapping.releaseYearStatus, movie);

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

      // RATINS
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
      movie.isOriginalVersionAvailable = this.mapping.isOriginalVersionAvailable === 'yes' ? true : false;

      // LANGUAGES (Available versions(s))
      formatAvailableLanguages(this.mapping.languages, movie, importErrors);

      // SCREENER LINK
      if (this.mapping.screenerLink) {
        movie.promotional.screener_link = this.mapping.screenerLink;
      }

      // PROMO REEL LINK
      if (this.mapping.promoReelLink) {
        movie.promotional.promo_reel_link = this.mapping.promoReelLink;
      }

      // TRAILER LINK
      if (this.mapping.trailerLink) {
        movie.promotional.trailer_link = this.mapping.trailerLink;
      }

      // PITCH TEASER LINK
      if (this.mapping.pitchTeaserLink) {
        movie.promotional.teaser_link = this.mapping.pitchTeaserLink;
      }

      //////////////////
      // FESTIVAL FIELDS
      //////////////////

      formatDistributionRights(this.mapping.territoriesSold, this.mapping.territoriesExcluded, importErrors);

      //////////////////
      // ADMIN FIELDS
      //////////////////

      if (this.isUserBlockframesAdmin) {
        // SCORING (Scoring)
        formatSingleValue(this.mapping.scoring, 'scoring', 'scoring', movie);

        // STORE TYPE
        formatSingleValue(this.mapping.storeType, 'storeType', 'storeConfig.storeType', movie);

        // MOVIE STATUS
        formatSingleValue(this.mapping.storeStatus, 'storeStatus', 'storeConfig.status', movie);

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

    //////////////////
    // ADMIN FIELDS
    //////////////////

    if (this.isUserBlockframesAdmin) {
      if (!movie.scoring) {
        errors.push({
          type: 'warning',
          field: 'movie.scoring',
          name: 'Scoring',
          reason: 'Optional field is missing',
          hint: 'Edit corresponding sheet field.'
        });
      }
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
    if (fieldConfig.multiLine) {
      if (fieldConfig.fields) {
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
      } else {
        return this.currentRows.map(r => {
          const value = r[fieldConfig.index];
          if (value) {
            return isNaN(value) ? value.trim() : value.toString();
          } else {
            return '';
          }
        }).filter(m => !!m);
      }
    } else {
      if (this.currentRows.length) {
        const value = this.currentRows[0][fieldConfig.index];
        if (value) {
          return isNaN(value) ? value.trim() : value.toString();
        } else {
          return '';
        }
      } else { return ''; }
    }
  }
}
