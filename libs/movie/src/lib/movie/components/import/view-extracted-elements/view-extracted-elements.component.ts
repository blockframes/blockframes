import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Movie, MovieQuery, MovieAvailability, Prize } from '../../../+state';
import { SheetTab } from '@blockframes/utils';
import { SSF$Date } from 'ssf/types';
import { AngularFireStorage } from '@angular/fire/storage';
import { HttpClient } from '@angular/common/http';
import { getCodeIfExists } from '../../../staticModels';
import { SSF } from 'xlsx';

export interface SpreadsheetImportError {
  field: string;
  name: string;
  reason: string;
  type: string;
  hint?: string;
}

export interface MovieImportState   {
  movie: Movie;
  errors?: SpreadsheetImportError[];
}

export interface SalesImportState {
  sale: MovieAvailability; // @todo #643 rename into sales
  errors?: SpreadsheetImportError[];
}

@Component({
  selector: 'movie-view-extracted-elements',
  templateUrl: './view-extracted-elements.component.html',
  styleUrls: ['./view-extracted-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedElementsComponent {

  public moviesToCreate = new MatTableDataSource<MovieImportState>();
  public moviesToUpdate = new MatTableDataSource<MovieImportState>();
  public availabilities = new MatTableDataSource<SalesImportState>();

  constructor(
    private movieQuery: MovieQuery,
    private afStorage: AngularFireStorage,
    private httpClient: HttpClient,
    private cdRef: ChangeDetectorRef,
  ) { }


  public formatMovies(sheetTab: SheetTab) {
    this.clearDataSources();

    sheetTab.rows.forEach(async spreadSheetRow => {
      if (spreadSheetRow[1]) {
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
          salesInfo: {
            certifications: [],
            internationalPremiere: {},
            broadcasterCoproducers: [],
          },
          versionInfo: {
            dubbings: [],
            subtitles: [],
          },
          festivalPrizes: {
            prizes: [],
          }
        } as Movie;

        const importErrors = { movie, errors: [] }  as MovieImportState;

        //////////////////
        // REQUIRED FIELDS
        //////////////////

        // INTERNAL REF (Film Code)
        movie.main.internalRef = spreadSheetRow[0];

        // ORIGINAL TITLE (Original Title)
        movie.main.title.original = spreadSheetRow[1];

        // PRODUCTION YEAR
        if (!isNaN(Number(spreadSheetRow[2]))) {
          movie.main.productionYear = parseInt(spreadSheetRow[2], 10);
        }

        // SCORING (Scoring)
        const scoring = getCodeIfExists('SCORING', spreadSheetRow[3]);
        if (scoring !== false) {
          movie.salesInfo.scoring = scoring;
        } else {
          importErrors.errors.push({
            type: 'error',
            field: 'salesInfo.scoring',
            name: "Scoring",
            reason: 'Required field could not be parsed',
            hint: 'Edit corresponding sheet field.'
          } as SpreadsheetImportError);

        }

        // ?? (Mandate End of rights)
        // spreadSheetRow[4]

        // ?? (Mandate Territories)
        // spreadSheetRow[5]

        // ?? (Mandate Medias)
        // spreadSheetRow[6]

        // DIRECTORS (Director(s))
        if (spreadSheetRow[7]) {
          spreadSheetRow[7].split(',').forEach((a: string) => {
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
        const data = await this.getImage(spreadSheetRow[8]);
        if (data !== false) {
          const snapshot = await this.afStorage.upload(`movies/${spreadSheetRow[8].split('/')[spreadSheetRow[8].split('/').length - 1]}`, data)
          const url = await snapshot.ref.getDownloadURL();
          movie.main.poster = url;
        }

        //////////////////
        // OPTIONAL FIELDS
        //////////////////

        // ISAN (ISAN Number)
        movie.main.isan = spreadSheetRow[9];


        // INTERNATIONAL TITLE (International Title)
        movie.main.title.international = spreadSheetRow[10];

        // LENGTH (Length)
        if (!isNaN(Number(spreadSheetRow[11]))) {
          movie.main.length = parseInt(spreadSheetRow[11], 10);
        }

        // PRODUCTION COMPANIES (Production Companie(s))
        if (spreadSheetRow[12]) {
          spreadSheetRow[12].split(',').forEach((p: string) => {
            movie.main.productionCompanies.push({ firstName: p });
          });
        }

        // BROADCASTER COPRODUCERS (TV / Platform coproducer(s))
        if (spreadSheetRow[13]) {
          spreadSheetRow[13].split(',').forEach((p: string) => {
            movie.salesInfo.broadcasterCoproducers.push(p);
          });
        }

        // BROADCASTER COPRODUCERS (Color / Black & White )
        movie.salesInfo.color = spreadSheetRow[14];
        const color = getCodeIfExists('COLORS', spreadSheetRow[14]);
        if (color !== false) {
          movie.salesInfo.color = color;
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'salesInfo.color',
            name: "Color",
            reason: 'Optional field could not be parsed',
            hint: 'Edit corresponding sheet field.'
          } as SpreadsheetImportError);

        }

        // ORIGIN COUNTRY (Country of Origin)
        if (spreadSheetRow[15]) {
          const country = getCodeIfExists('COUNTRIES', spreadSheetRow[15]);
          if (country !== false) {
            movie.main.originCountry = country;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'main.originCountry',
              name: "Country of origin",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);

          }
        }

        // CERTIFICATIONS (European Qualification)
        movie.salesInfo.europeanQualification = spreadSheetRow[16].toLowerCase() === 'yes' ? true : false;

        // PEGI (Rating)
        movie.salesInfo.pegi = spreadSheetRow[17];

        // CERTIFICATIONS (Certifications)
        if (spreadSheetRow[18]) {
          spreadSheetRow[18].split(',').forEach((c: string) => {
            const certification = getCodeIfExists('CERTIFICATIONS', c);
            if (certification !== false) {
              movie.salesInfo.certifications.push(certification);
            } else {
              importErrors.errors.push({
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
        if (spreadSheetRow[19]) {
          spreadSheetRow[19].split(',').forEach((a: string) => {
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
        movie.main.shortSynopsis = spreadSheetRow[20];

        // INTERNATIONAL PREMIERE (International Premiere )
        if (spreadSheetRow[21]) {
          if (spreadSheetRow[21].split(',').length === 2 && !isNaN(Number(spreadSheetRow[21].split(',')[1]))) {
            movie.salesInfo.internationalPremiere.name = spreadSheetRow[21].split(',')[0];
            movie.salesInfo.internationalPremiere.year = Number(spreadSheetRow[21].split(',')[1]);
          }
        }

        // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
        const originCountryReleaseDate: SSF$Date = SSF.parse_date_code(spreadSheetRow[22]);
        movie.salesInfo.originCountryReleaseDate = new Date(`${originCountryReleaseDate.y}-${originCountryReleaseDate.m}-${originCountryReleaseDate.d}`);

        // GENRES (Genres)
        if (spreadSheetRow[23]) {
          let errors = false;
          spreadSheetRow[23].split(',').forEach((g: string) => {
            const genre = getCodeIfExists('GENRES', g);
            if (genre !== false) {
              movie.main.genres.push(genre);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'genres',
              name: "Genres",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // PRIZES (Prizes)
        if (spreadSheetRow[24]) {
          spreadSheetRow[24].split(',').forEach((p: string) => {

            if (p.split(';').length === 3) {
              const prize = { name: '', year: undefined, prize: '' } as Prize;
              prize.name = p.split(';')[0];
              prize.year = parseInt(p.split(';')[1], 10);
              prize.prize = p.split(';')[2];
              movie.festivalPrizes.prizes.push(prize);
            }

          });
        }

        // KEY ASSETS (Key Assets)
        if (spreadSheetRow[25]) {
          spreadSheetRow[25].split(',').forEach((k: string) => {
            movie.promotionalDescription.keyAssets.push(k);
          });
        }

        // KEYWORDS
        if (spreadSheetRow[26]) {
          spreadSheetRow[26].split(',').forEach((k: string) => {
            movie.promotionalDescription.keywords.push(k);
          });
        }

        // LANGUAGES (Original Language(s))
        if (spreadSheetRow[27]) {
          let errors = false;
          spreadSheetRow[27].split(',').forEach((g: string) => {
            const language = getCodeIfExists('LANGUAGES', g);
            if (language !== false) {
              movie.main.languages.push(language);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'languages',
              name: "Languages",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // DUBS (Available dubbing(s))
        if (spreadSheetRow[28]) {
          let errors = false;
          spreadSheetRow[28].split(',').forEach((g: string) => {
            const dubbing = getCodeIfExists('LANGUAGES', g);
            if (dubbing !== false) {
              movie.versionInfo.dubbings.push(dubbing);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'dubbing',
              name: "Dubbings",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // SUBTILES (Available subtitle(s))
        if (spreadSheetRow[29]) {
          let errors = false;
          spreadSheetRow[29].split(',').forEach((g: string) => {
            const subtitle = getCodeIfExists('LANGUAGES', g);
            if (subtitle !== false) {
              movie.versionInfo.subtitles.push(subtitle);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
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

        const movieWithErrors = this.validateMovie(importErrors);
        // check if movie is already in database
        movieWithErrors.movie.id = this.movieQuery.movieExists(movie.main.internalRef);
        if (movieWithErrors.movie.id) {
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
    if (imageUrl) {
      return this.httpClient
        .get(imageUrl, { responseType: 'blob' })
        .toPromise()
        .catch(_ => new Promise((resolve) => resolve(false)))
    } else {
      return new Promise((resolve) => resolve(false));
    }
  }

  private validateMovie(importErrors: MovieImportState): MovieImportState {
    const movie = importErrors.movie;
    const errors = importErrors.errors;
    //////////////////
    // REQUIRED FIELDS
    //////////////////

    if (!movie.main.internalRef) {
      errors.push({
        type: 'error',
        field: 'internalRef',
        name: "Film Code ",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.title.original) {
      errors.push({
        type: 'error',
        field: 'title.original',
        name: "Original title",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.productionYear) {
      errors.push({
        type: 'error',
        field: 'productionYear',
        name: "Production Year",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesInfo.scoring) {
      errors.push({
        type: 'error',
        field: 'salesInfo.scoring',
        name: "Scoring",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }


    // @todo #643 (Mandate End of rights)

    // @todo #643 (Mandate Territories)

    // @todo #643 (Mandate Medias)

    if (movie.main.directors.length === 0) {
      errors.push({
        type: 'error',
        field: 'directors',
        name: "Directors",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.poster) {
      errors.push({
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

    if (!movie.main.isan) {
      errors.push({
        type: 'warning',
        field: 'main.isan',
        name: "ISAN number",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.title.international) {
      errors.push({
        type: 'warning',
        field: 'main.title.international',
        name: "International title",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.length) {
      errors.push({
        type: 'warning',
        field: 'main.length',
        name: "Length",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.productionCompanies.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.productionCompanies',
        name: "Production Companie(s)",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.salesInfo.broadcasterCoproducers.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.salesInfo.broadcasterCoproducers',
        name: "TV / Platform coproducer(s)",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesInfo.color) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.color',
        name: "Color / Black & White ",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.originCountry) {
      errors.push({
        type: 'warning',
        field: 'main.originCountry',
        name: "Country of origin",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesInfo.certifications) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.certifications',
        name: "Certifications",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesInfo.pegi) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.pegi',
        name: 'Rating',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.salesCast.credits.length === 0) {
      errors.push({
        type: 'warning',
        field: 'salesCast.credits',
        name: "Principal Cast",
        reason: 'Optional fields are missing',
        hint: 'Edit corresponding sheets fields: directors, principal cast.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.shortSynopsis) {
      errors.push({
        type: 'warning',
        field: 'main.shortSynopsis',
        name: "Synopsis",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesInfo.internationalPremiere) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.internationalPremiere',
        name: "International Premiere",
        reason: 'Optional field is missing or could not be parsed',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesInfo.originCountryReleaseDate) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.originCountryReleaseDate',
        name: 'Release date in Origin Country',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.genres.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.genres',
        name: "Genres",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.festivalPrizes.prizes.length === 0) {
      errors.push({
        type: 'warning',
        field: 'festivalPrizes.prizes',
        name: "Festival Prizes",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.promotionalDescription.keyAssets.length === 0) {
      errors.push({
        type: 'warning',
        field: 'promotionalDescription.keyAssets',
        name: "Key assets",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.promotionalDescription.keywords.length === 0) {
      errors.push({
        type: 'warning',
        field: 'promotionalDescription.keywords',
        name: "Keywords",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.languages.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.languages',
        name: "Languages",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.versionInfo.dubbings.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.dubbings',
        name: "Dubbings",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.versionInfo.subtitles.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.subtitles',
        name: "Subtitles",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    return importErrors;
  }


  public formatAvailabilities(sheetTab: SheetTab) {
    this.clearDataSources();
    sheetTab.rows.forEach(spreadSheetRow => {

      if (spreadSheetRow[0]) {
        const movie = {
          main: {
            title: {original: spreadSheetRow[0]},
            productionYear: parseInt(spreadSheetRow[1], 10),
            directors: [spreadSheetRow[2]]
          },
        } as Partial<Movie>; // @todo rework for #643

        const movieId = this.movieQuery.movieExists(movie.main.internalRef);

        const start: SSF$Date = SSF.parse_date_code(spreadSheetRow[5]);
        const end: SSF$Date = SSF.parse_date_code(spreadSheetRow[6]);

        const sale = {
          movieId,
          movie,
          territories: spreadSheetRow[3].split(','),
          rights: spreadSheetRow[4] ? spreadSheetRow[4].split(',') : [],
          start: new Date(`${start.y}-${start.m}-${start.d}`),
          end: new Date(`${end.y}-${end.m}-${end.d}`),
          languages: spreadSheetRow[7] ? spreadSheetRow[7].split(',') : [],
          exclusivity: spreadSheetRow[8] === 'Y' ? true : false,

        } as MovieAvailability;
        
        const importErrors = { sale, errors: [] }  as SalesImportState;

        this.validateMovieAvailability(importErrors);

        this.availabilities.data.push(importErrors);
        this.availabilities.data = [... this.availabilities.data];

      }

    });
  }

  private validateMovieAvailability(importErrors: SalesImportState): SpreadsheetImportError[] {
    const availability = importErrors.sale;

    importErrors.errors = [];

    if (!availability.movieId) {
      importErrors.errors.push({
        type: 'error',
        field: 'movieId',
        name: "Movie",
        reason: 'Movie not found',
        hint: 'Try importing it first or check if data is correct.'
      } as SpreadsheetImportError);
    }

    return importErrors.errors;
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
    this.availabilities.data = [];
  }
}
