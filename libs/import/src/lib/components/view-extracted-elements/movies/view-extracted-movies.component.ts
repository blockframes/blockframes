import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MovieService, createMovie } from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { Crew, Producer } from '@blockframes/utils/common-interfaces/identity';
import { Intercom } from 'ng-intercom';
// import { ImageUploader } from '@blockframes/media/+state/image-uploader.service'; TODO issue #3091
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import {
  formatBoxOffice,
  formatContentType,
  formatCredits,
  formatGenres,
  formatOriginalLanguages,
  formatOriginalRelease,
  formatOriginCountries,
  formatPrizes,
  formatProductionStatus,
  formatReleaseYear,
  formatRunningTime,
  formatStakeholders
} from '@blockframes/utils/spreadsheet/format';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { UserService } from '@blockframes/user/+state/user.service';
import { MovieImportState } from '../../../import-utils';


const fields = {
  internationalTitle: {
    multiLine: false,
    index: 0
  },
  originalTitle: {
    multiLine: false,
    index: 1
  },
  internalRef: {
    multiLine: false,
    index: 2
  },
  contentType: {
    multiLine: false,
    index: 3
  },
  productionStatus: {
    multiLine: false,
    index: 4
  },
  releaseYear: {
    multiLine: false,
    index: 5
  },
  releaseYearStatus: {
    multiLine: false,
    index: 6
  },
  directors: {
    multiLine: true,
    fields: {
      firstName: 7,
      lastName: 8,
      filmography: 9,
    }
  },
  originCountries: {
    multiLine: true,
    index: 10
  },
  stakeholders: {
    multiLine: true,
    fields: {
      displayName: 11,
      role: 12,
      country: 13,
    }
  },
  originalRelease: {
    multiLine: true,
    fields: {
      country: 14,
      media: 15,
      date: 16,
    }
  },
  originalLanguages: {
    multiLine: true,
    index: 17
  },
  genres: {
    multiLine: true,
    index: 18
  },
  customGenres: {
    multiLine: true,
    index: 19
  },
  runningTime: {
    multiLine: false,
    index: 20
  },
  runningTimeStatus: {
    multiLine: false,
    index: 21
  },
  cast: {
    multiLine: true,
    fields: {
      firstName: 22,
      lastName: 23,
      status: 24,
    }
  },
  prizes: {
    multiLine: true,
    fields: {
      name: 25,
      year: 26,
      prize: 27,
      premiere: 28,
    }
  },
  synopsis: {
    multiLine: false,
    index: 29
  },
  keyAssets: {
    multiLine: false,
    index: 30
  },
  keywords: {
    multiLine: false,
    index: 31
  },
  producers: {
    multiLine: true,
    fields: {
      firstName: 32,
      lastName: 33,
      role: 34,
    }
  },
  crew: {
    multiLine: true,
    fields: {
      firstName: 35,
      lastName: 36,
      role: 37,
    }
  },
  budgetRange: {
    multiLine: false,
    index: 38
  },
  boxoffice: {
    multiLine: true,
    fields: {
      territory: 39,
      unit: 40,
      value: 41,
    }
  }
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
    // private imageUploader: ImageUploader, TODO issue #3091
    private cdRef: ChangeDetectorRef,
    private authQuery: AuthQuery,
    private userService: UserService,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Submit your titles')
  }

  ngOnInit() {
    this.isUserBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    this.cdRef.markForCheck();
  }

  public async format(sheetTab: SheetTab) {
    this.clearDataSources();

    // @TODO #3816 remmove "publish to market place" il manque les images => status draft uniquement
    // @TODO missing release year | status
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

      // RELEASE YER
      formatReleaseYear(this.mapping.releaseYear, this.mapping.releaseYearStatus, movie, importErrors);

      // PRODUCTION COMPANIES (Production Companie(s))
      formatStakeholders(this.mapping.stakeholders, movie, importErrors);

      // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
      movie.originalRelease = formatOriginalRelease(this.mapping.originalRelease, importErrors);

      // LANGUAGES (Original Language(s))
      formatOriginalLanguages(this.mapping.originalLanguages, movie, importErrors);

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

      // BOX OFFICE
      movie.boxOffice = formatBoxOffice(this.mapping.boxoffice, importErrors);

      console.log(movie);
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

    // TODO issue #3091
    // if (!movie.poster) {
    //   errors.push({
    //     type: 'error',
    //     field: 'poster',
    //     name: 'Poster',
    //     reason: 'Required field is missing',
    //     hint: 'Add poster URL in corresponding column.'
    //   });
    // }

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
              obj[k] = isNaN(value) ? value.trim() : value;
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
            return isNaN(value) ? value.trim() : value;
          } else {
            return '';
          }
        }).filter(m => !!m);
      }
    } else {
      if (this.currentRows.length) {
        const value = this.currentRows[0][fieldConfig.index];
        if (value) {
          return isNaN(value) ? value.trim() : value;
        } else {
          return '';
        }
      } else { return ''; }
    }
  }
}
