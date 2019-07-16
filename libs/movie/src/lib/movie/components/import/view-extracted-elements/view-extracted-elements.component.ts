import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Movie, MovieQuery, MovieAvailability } from '../../../+state';
import { SheetTab } from '@blockframes/utils';
import * as XLSX from 'xlsx';
import { SSF$Date } from 'ssf/types';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { getSlug } from '../../../staticModels';

export interface ExcelImportError {
  field: string;
  name: string;
  reason: string;
  type: string;
  hint?: string;
}

export interface MovieWithMetaData extends Movie {
  errors?: ExcelImportError[];
}

export interface MovieAvailabilityWithMetaData extends MovieAvailability {
  errors?: ExcelImportError[];
}

@Component({
  selector: 'movie-view-extracted-elements',
  templateUrl: './view-extracted-elements.component.html',
  styleUrls: ['./view-extracted-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedElementsComponent {

  public moviesToCreate = new MatTableDataSource<MovieWithMetaData>();
  public moviesToUpdate = new MatTableDataSource<MovieWithMetaData>();
  public availabilities = new MatTableDataSource<MovieAvailabilityWithMetaData>();

  constructor(
    private movieQuery: MovieQuery,
    private afStorage: AngularFireStorage,
    private httpClient: HttpClient,
  ) { }


  formatMovies(sheetTab: SheetTab) {
    this._clearDataSources();

    sheetTab.rows.forEach(m => {
      if (m[1] !== undefined) {
        const movie = {
          title: {
            original: m[1],
            international: m[2]
          },
          directorName: m[3],
          synopsis: m[5],
          types: [],
          genres: [],
          originCountry: 'TODO',
          languages: [],
          errors: [],
          keywords: [],
          credits: [],
          status: 'finished', // all imported movies are in finished state
          // todo
        } as MovieWithMetaData;


        // GENRES
        if (m[7] !== undefined) {
          let errors = false;
          m[7].split(',').forEach((g: string) => {
            const genre = getSlug('GENRES', g);
            if (genre !== false) {
              movie.genres.push(genre);
            } else {
              errors = true;
            }
          });

          if (errors) {
            movie.errors.push({
              type: 'warning',
              field: 'genres',
              name: "Genres",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as ExcelImportError);
          }
        }

        // CREDITS
        // Actors
        if (m[4] !== undefined) {
          m[4].split(',').forEach((a: string) => {
            const credit = { firstName: '', lastName: '', creditRole: 'actor' };

            if (a.split("\\s+").length > 1) {
              credit.firstName = a.split("\\s+")[0];
              credit.lastName = a.split("\\s+")[1];
            } else {
              credit.lastName = a.split("\\s+")[0];
            }

            movie.credits.push(credit);
          });
        }

        // KEYWORDS
        if (m[10] !== undefined) {
          m[10].split(',').forEach((k: string) => {
            movie.keywords.push(k);
          });
        }

        // LANGUAGES
        if (m[11] !== undefined) {
          let errors = false;
          m[11].split(',').forEach((g: string) => {
            const language = getSlug('LANGUAGES', g);
            if (language !== false) {
              movie.languages.push(language);
            } else {
              errors = true;
            }
          });

          if (errors) {
            movie.errors.push({
              type: 'warning',
              field: 'languages',
              name: "Languages",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as ExcelImportError);
          }
        }

        // ORIGIN COUNTRY
        if (m[19] !== undefined) {
          const country = getSlug('COUNTRIES', m[19]);
          if (country !== false) {
            movie.originCountry = country;
          } else {
            movie.errors.push({
              type: 'warning',
              field: 'originCountry',
              name: "Country of origin",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as ExcelImportError);

          }
        }

        if (!isNaN(Number(m[8]))) {
          movie.productionYear = parseInt(m[8]);
        }

        this.getImage(m[17])
          .then(data => {
            if (data !== false) {
              return this.afStorage.upload(`movies/${m[17].split('/')[m[17].split('/').length - 1]}`, data)
                .then(snapshot => snapshot.ref.getDownloadURL())
                .then(url => movie.poster = url)
            } else { return false; }
          })
          .then(_ => this._validateMovie(movie))
          .then(movie => {
            // check if movie is already in database
            movie.id = this.movieQuery.movieExists(movie.title.original, movie.productionYear, movie.directorName);
            return movie;
          })
          .then(movie => {
            // @todo use createMovie of movieModel ?
            if (movie.id !== undefined) {
              this.moviesToUpdate.data.push(movie);
              this.moviesToUpdate.data = [... this.moviesToUpdate.data];
            } else {
              this.moviesToCreate.data.push(movie);
              this.moviesToCreate.data = [... this.moviesToCreate.data];
            }
          })
      }
    });
    /*


    => PROPOSER UN FORMAT XLS A VINCENT

    export interface Movie {

  productionYear: number,
  types: string[],
  genres: string[],
  originCountry: string,
  coProducerCountries: string[],
  languages: string[],
  status: string,
  logline: string,
  synopsis: string,
  keywords: string[],
  credits: {firstName: string, lastName: string, creditRole: string}[],
  images: string[],
  promotionalElements: {label: string, url: string}[],

  // not main movie attributes WIP
  ipId: string,
  isan: number,
  directorNote: string,
  producerNote: string,
  goalBudget: number,
  movieCurrency: string,
  fundedBudget: number,
  breakeven: number,
  backendProfit: number,
  potentialRevenues: number,
  selectionCategories: string,
  _type: 'movies',
  materials?: Material[];
  stakeholders?: Stakeholder[];
}*/
  }

  private getImage(imageUrl: string): Promise<Blob | boolean> {
    if (imageUrl !== undefined) {
      return this.httpClient
        .get(imageUrl, { responseType: 'blob' })
        .toPromise()
        .catch(_ => new Promise((resolve) => resolve(false)))
    } else {
      return new Promise((resolve) => resolve(false));
    }
  }

  private _validateMovie(movie: MovieWithMetaData): MovieWithMetaData {

    if (!movie.productionYear) {
      movie.errors.push({
        type: 'error',
        field: 'productionYear',
        name: "Production Year",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (!movie.title.international) {
      movie.errors.push({
        type: 'warning',
        field: 'title.international',
        name: "International title",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (!movie.title.original) {
      movie.errors.push({
        type: 'error',
        field: 'title.original',
        name: "Original title",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (!movie.synopsis) {
      movie.errors.push({
        type: 'warning',
        field: 'synopsis',
        name: "Synopsis",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (!movie.directorName) {
      movie.errors.push({
        type: 'error',
        field: 'directorName',
        name: "Director Name",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (!movie.poster) {
      movie.errors.push({
        type: 'error',
        field: 'poster',
        name: "Poster",
        reason: 'Required field is missing',
        hint: 'Add poster URL in corresponding column.'
      } as ExcelImportError);
    }

    if (movie.genres.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'genres',
        name: "Genres",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (movie.languages.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'languages',
        name: "Languages",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (movie.credits.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'credits',
        name: "Credits",
        reason: 'Optional fields are missing',
        hint: 'Edit corresponding sheets fields: directors, principal cast.'
      } as ExcelImportError);
    }

    if (movie.keywords.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'keywords',
        name: "Keywords",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    if (!movie.originCountry) {
      movie.errors.push({
        type: 'warning',
        field: 'originCountry',
        name: "Country of origin",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as ExcelImportError);
    }

    return movie;
  }


  public formatAvailabilities(sheetTab: SheetTab) {
    this._clearDataSources();
    sheetTab.rows.forEach(m => {

      if (m[0] !== undefined) {
        const movie = {
          title: { original: m[0] },
          directorName: m[2],
          productionYear: parseInt(m[1]),
        } as Partial<Movie>;

        const movieId = this.movieQuery.movieExists(movie.title.original, movie.productionYear, movie.directorName);

        const start: SSF$Date = XLSX.SSF.parse_date_code(m[5]);
        const end: SSF$Date = XLSX.SSF.parse_date_code(m[6]);

        const availability = {
          movieId,
          movie,
          territories: m[3].split(','),
          rights: m[4] !== undefined ? m[4].split(',') : [],
          start: new Date(`${start.y}-${start.m}-${start.d}`),
          end: new Date(`${end.y}-${end.m}-${end.d}`),
          languages: m[7] !== undefined ? m[7].split(',') : [],
          exclusivity: m[8] === 'Y' ? true : false,

        } as MovieAvailabilityWithMetaData;

        this._validateMovieAvailability(availability);

        this.availabilities.data.push(availability);
        this.availabilities.data = [... this.availabilities.data];

      }

    });
  }

  private _validateMovieAvailability(availability: MovieAvailabilityWithMetaData): ExcelImportError[] {
    availability.errors = [];

    if (!availability.movieId) {
      availability.errors.push({
        type: 'error',
        field: 'movieId',
        name: "Movie",
        reason: 'Movie not found',
        hint: 'Try importing it first or check if data is correct.'
      } as ExcelImportError);
    }

    return availability.errors;
  }

  private _clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
    this.availabilities.data = [];
  }
}
