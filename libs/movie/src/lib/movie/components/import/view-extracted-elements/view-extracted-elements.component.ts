import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Movie, MovieQuery, MovieAvailability } from '../../../+state';
import { SheetTab } from '@blockframes/utils';
import { SSF$Date } from 'ssf/types';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { getSlug } from '../../../staticModels';
import { SSF } from 'xlsx';

export interface SpreadsheetImportError {
  field: string;
  name: string;
  reason: string;
  type: string;
  hint?: string;
}

export interface MovieWithMetaData extends Movie {
  errors?: SpreadsheetImportError[];
}

export interface MovieAvailabilityWithMetaData extends MovieAvailability {
  errors?: SpreadsheetImportError[];
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
    private cdRef: ChangeDetectorRef,
  ) { }


  public formatMovies(sheetTab: SheetTab) {
    this.clearDataSources();

    sheetTab.rows.forEach(async m => {
      if (m[1] !== undefined) {
        const movie = {
          main: {
            title: {},
            directors: [],
            genres: [],
            languages: [],
            productionCompanies: [],
            status: 'finished', // all imported movies are in finished state
          }, 
          promotionalDescription: {
            keywords: [],
            keyAssets: [],
          },
          salesCast: {
            credits: [],
          },
          internationalPremiere: {},
          dubbings: [],
          subtitles: [],
          errors: [],
          prizes: [],
          broadcasterCoproducers: [],
          certifications: [],
        } as MovieWithMetaData;

        //////////////////
        // REQUIRED FIELDS
        //////////////////

        // INTERNAL REF (Film Code)
        movie.main.internalRef = m[0];

        // ORIGINAL TITLE (Original Title)
        movie.main.title.original = m[1];

        // PRODUCTION YEAR
        if (!isNaN(Number(m[2]))) {
          movie.main.productionYear = parseInt(m[2], 10);
        }

        // SCORING (Scoring)
        movie.scoring = m[3];

        // ?? (Mandate End of rights)
        // m[4]

        // ?? (Mandate Territories)
        // m[5]

        // ?? (Mandate Medias)
        // m[6]

        // DIRECTORS (Director(s))
        if (m[7] !== undefined) {
          m[7].split(',').forEach((a: string) => {
            const director = { firstName: '', lastName: '' };

            if (a.split("\\s+").length > 1) {
              director.firstName = a.split("\\s+")[0];
              director.lastName = a.split("\\s+")[1];
            } else {
              director.lastName = a.split("\\s+")[0];
            }

            movie.main.directors.push(director);
          });
        }

        // POSTER (Poster)
        const data = await this.getImage(m[8]);
        if (data !== false) {
          const snapshot = await this.afStorage.upload(`movies/${m[8].split('/')[m[8].split('/').length - 1]}`, data)
          const url = await snapshot.ref.getDownloadURL();
          movie.main.poster = url;
        }

        //////////////////
        // OPTIONAL FIELDS
        //////////////////

        // ISAN (ISAN Number)
        movie.isan = m[9];


        // INTERNATIONAL TITLE (International Title)
        movie.main.title.international = m[10];

        // LENGTH (Length)
        if (!isNaN(Number(m[11]))) {
          movie.main.length = parseInt(m[11], 10);
        }

        // PRODUCTION COMPANIES (Production Companie(s))
        if (m[12] !== undefined) {
          m[12].split(',').forEach((p: string) => {
            movie.main.productionCompanies.push({ firstName: p });
          });
        }

        // BROADCASTER COPRODUCERS (TV / Platform coproducer(s))
        if (m[13] !== undefined) {
          m[13].split(',').forEach((p: string) => {
            movie.broadcasterCoproducers.push(p);
          });
        }

        // BROADCASTER COPRODUCERS (Color / Black & White )
        movie.color = m[14];

        // ORIGIN COUNTRY (Country of Origin)
        if (m[15] !== undefined) {
          const country = getSlug('COUNTRIES', m[15]);
          if (country !== false) {
            movie.main.originCountry = country;
          } else {
            movie.errors.push({
              type: 'warning',
              field: 'main.originCountry',
              name: "Country of origin",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);

          }
        }

        // CERTIFICATIONS (European Qualification)
        if (m[16].toLowerCase() === 'yes') {
          movie.certifications.push('european-qualification');
        }

        // PEGI (Rating)
        movie.pegi = m[17];

        // CERTIFICATIONS (Certifications)
        if (m[18] !== undefined) {
          m[18].split(',').forEach((c: string) => {
            const certification = getSlug('CERTIFICATIONS', c);
            if (certification !== false) {
              movie.certifications.push(certification);
            } else {
              movie.errors.push({
                type: 'warning',
                field: 'certifications',
                name: "Certifications",
                reason: 'Optional field could not be parsed',
                hint: 'Edit corresponding sheet field.'
              } as SpreadsheetImportError);
            }
          });

        }

        // CREDITS (Principal Cast)
        if (m[19] !== undefined) {
          m[19].split(',').forEach((a: string) => {
            const credit = { firstName: '', lastName: '', creditRole: 'actor' };

            if (a.split("\\s+").length > 1) {
              credit.firstName = a.split("\\s+")[0];
              credit.lastName = a.split("\\s+")[1];
            } else {
              credit.lastName = a.split("\\s+")[0];
            }

            movie.salesCast.credits.push(credit);
          });
        }

        // SYNOPSIS (Short Synopsis)
        movie.main.shortSynopsis = m[20];

        // INTERNATIONAL PREMIERE (International Premiere )
        if (m[21] !== undefined) {
          if (m[21].split(',').length === 2 && !isNaN(Number(m[21].split(',')[1]))) {
            movie.internationalPremiere.name = m[21].split(',')[0];
            movie.internationalPremiere.year = Number(m[21].split(',')[1]);
          }
        }

        // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
        const originCountryReleaseDate: SSF$Date = SSF.parse_date_code(m[22]);
        movie.originCountryReleaseDate = new Date(`${originCountryReleaseDate.y}-${originCountryReleaseDate.m}-${originCountryReleaseDate.d}`);

        // GENRES (Genres)
        if (m[23] !== undefined) {
          let errors = false;
          m[23].split(',').forEach((g: string) => {
            const genre = getSlug('GENRES', g);
            if (genre !== false) {
              movie.main.genres.push(genre);
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
            } as SpreadsheetImportError);
          }
        }

        // PRIZES (Prizes)
        if (m[24] !== undefined) {
          m[24].split(',').forEach((p: string) => {

            if (p.split(';').length === 3) {
              const prize = { name: '', year: '', prize: '' };
              prize.name = p.split(';')[0];
              prize.year = p.split(';')[1];
              prize.prize = p.split(';')[2];
              movie.prizes.push(prize);
            }

          });
        }

        // KEY ASSETS (Key Assets)
        if (m[25] !== undefined) {
          m[25].split(',').forEach((k: string) => {
            movie.promotionalDescription.keyAssets.push(k);
          });
        }

        // KEYWORDS
        if (m[26] !== undefined) {
          m[26].split(',').forEach((k: string) => {
            movie.promotionalDescription.keywords.push(k);
          });
        }

        // LANGUAGES (Original Language(s))
        if (m[27] !== undefined) {
          let errors = false;
          m[27].split(',').forEach((g: string) => {
            const language = getSlug('LANGUAGES', g);
            if (language !== false) {
              movie.main.languages.push(language);
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
            } as SpreadsheetImportError);
          }
        }

        // DUBS (Available dubbing(s))
        if (m[28] !== undefined) {
          let errors = false;
          m[28].split(',').forEach((g: string) => {
            const dubbing = getSlug('LANGUAGES', g);
            if (dubbing !== false) {
              movie.dubbings.push(dubbing);
            } else {
              errors = true;
            }
          });

          if (errors) {
            movie.errors.push({
              type: 'warning',
              field: 'dubbing',
              name: "Dubbings",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // SUBTILES (Available subtitle(s))
        if (m[29] !== undefined) {
          let errors = false;
          m[29].split(',').forEach((g: string) => {
            const subtitle = getSlug('LANGUAGES', g);
            if (subtitle !== false) {
              movie.subtitles.push(subtitle);
            } else {
              errors = true;
            }
          });

          if (errors) {
            movie.errors.push({
              type: 'warning',
              field: 'subtitle',
              name: "Subtitles",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        ///////////////
        // VALIDATION
        ///////////////

        const movieWithErrors = this.validateMovie(movie);
        // check if movie is already in database
        movieWithErrors.id = this.movieQuery.movieExists(movie.main.internalRef);
        if (movieWithErrors.id !== undefined) {
          this.moviesToUpdate.data.push(movieWithErrors);
          this.moviesToUpdate.data = [... this.moviesToUpdate.data];
        } else {
          this.moviesToCreate.data.push(movieWithErrors);
          this.moviesToCreate.data = [... this.moviesToCreate.data];
        }

        this.cdRef.detectChanges();
      }
    });
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

  private validateMovie(movie: MovieWithMetaData): MovieWithMetaData {

    //////////////////
    // REQUIRED FIELDS
    //////////////////

    if (!movie.main.internalRef) {
      movie.errors.push({
        type: 'error',
        field: 'internalRef',
        name: "Film Code ",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.title.original) {
      movie.errors.push({
        type: 'error',
        field: 'title.original',
        name: "Original title",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.productionYear) {
      movie.errors.push({
        type: 'error',
        field: 'productionYear',
        name: "Production Year",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.scoring) {
      movie.errors.push({
        type: 'error',
        field: 'scoring',
        name: "Scoring",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }


    // @todo #643 (Mandate End of rights)

    // @todo #643 (Mandate Territories)

    // @todo #643 (Mandate Medias)

    if (movie.main.directors.length === 0) {
      movie.errors.push({
        type: 'error',
        field: 'directors',
        name: "Directors",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.poster) {
      movie.errors.push({
        type: 'error',
        field: 'poster',
        name: "Poster",
        reason: 'Required field is missing',
        hint: 'Add poster URL in corresponding column.'
      } as SpreadsheetImportError);
    }

    //////////////////
    // OPTIONAL FIELDS
    //////////////////

    if (!movie.isan) {
      movie.errors.push({
        type: 'warning',
        field: 'isan',
        name: "ISAN number",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.title.international) {
      movie.errors.push({
        type: 'warning',
        field: 'main.title.international',
        name: "International title",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.length) {
      movie.errors.push({
        type: 'warning',
        field: 'main.length',
        name: "Length",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.productionCompanies.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'main.productionCompanies',
        name: "Production Companie(s)",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.broadcasterCoproducers.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'main.broadcasterCoproducers',
        name: "TV / Platform coproducer(s)",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.color) {
      movie.errors.push({
        type: 'warning',
        field: 'color',
        name: "Color / Black & White ",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.originCountry) {
      movie.errors.push({
        type: 'warning',
        field: 'main.originCountry',
        name: "Country of origin",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.certifications) {
      movie.errors.push({
        type: 'warning',
        field: 'certifications',
        name: "Certifications",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.pegi) {
      movie.errors.push({
        type: 'warning',
        field: 'pegi',
        name: 'Rating',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.salesCast.credits.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'salesCast.credits',
        name: "Principal Cast",
        reason: 'Optional fields are missing',
        hint: 'Edit corresponding sheets fields: directors, principal cast.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.shortSynopsis) {
      movie.errors.push({
        type: 'warning',
        field: 'main.shortSynopsis',
        name: "Synopsis",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.internationalPremiere) {
      movie.errors.push({
        type: 'warning',
        field: 'internationalPremiere',
        name: "International Premiere",
        reason: 'Optional field is missing or could not be parsed',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.originCountryReleaseDate) {
      movie.errors.push({
        type: 'warning',
        field: 'originCountryReleaseDate',
        name: 'Release date in Origin Country',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.genres.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'main.genres',
        name: "Genres",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.prizes.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'prizes',
        name: "Festival Prizes",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.promotionalDescription.keyAssets.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'promotionalDescription.keyAssets',
        name: "Key assets",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.promotionalDescription.keywords.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'promotionalDescription.keywords',
        name: "Keywords",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.languages.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'main.languages',
        name: "Languages",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.dubbings.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'dubbings',
        name: "Dubbings",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.subtitles.length === 0) {
      movie.errors.push({
        type: 'warning',
        field: 'subtitles',
        name: "Subtitles",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    return movie;
  }


  public formatAvailabilities(sheetTab: SheetTab) {
    this.clearDataSources();
    sheetTab.rows.forEach(m => {

      if (m[0] !== undefined) {
        const movie = {
          title: { original: m[0] },
          directorName: m[2],
          productionYear: parseInt(m[1], 10),
        } as Partial<Movie>;

        const movieId = this.movieQuery.movieExists(movie.main.internalRef);

        const start: SSF$Date = SSF.parse_date_code(m[5]);
        const end: SSF$Date = SSF.parse_date_code(m[6]);

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

        this.validateMovieAvailability(availability);

        this.availabilities.data.push(availability);
        this.availabilities.data = [... this.availabilities.data];

      }

    });
  }

  private validateMovieAvailability(availability: MovieAvailabilityWithMetaData): SpreadsheetImportError[] {
    availability.errors = [];

    if (!availability.movieId) {
      availability.errors.push({
        type: 'error',
        field: 'movieId',
        name: "Movie",
        reason: 'Movie not found',
        hint: 'Try importing it first or check if data is correct.'
      } as SpreadsheetImportError);
    }

    return availability.errors;
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
    this.availabilities.data = [];
  }
}
