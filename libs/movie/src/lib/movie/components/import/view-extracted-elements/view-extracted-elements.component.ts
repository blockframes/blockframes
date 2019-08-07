import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import {
  Movie,
  MovieQuery,
  MovieAvailability,
  Prize,
  createMovieMain,
  createMoviePromotionalDescription,
  createMovieSalesCast,
  createMovieSalesInfo,
  createMovieVersionInfo,
  createMovieFestivalPrizes,
  createMovieSalesAgentDeal
} from '../../../+state';
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

export interface MovieImportState {
  movie: Movie;
  errors?: SpreadsheetImportError[];
}

export interface SalesImportState {
  sale: MovieAvailability; // @todo #643 rename into sales
  errors?: SpreadsheetImportError[];
}

enum SpreadSheetMovie {
  internalRef,
  originalTitle,
  productionYear,
  scoring,
  rightsEnd,
  territories,
  medias,
  directors,
  poster,
  isan,
  internationalTitle,
  length,
  productionCompanies,
  broadcasterCoproducers,
  color,
  originCountry,
  europeanQualification,
  rating,
  certifications,
  cast,
  shortSynopsis,
  internationalPremiere,
  originCountryReleaseDate,
  genres,
  festivalPrizes,
  keyAssets,
  keywords,
  languages,
  dubbings,
  subtitles
}

enum SpreadSheetSale {
  internalRef,
  originalTitle,
  productionYear,
  directors,
  territories,
  rights,
  start,
  end,
  languages,
  exclusivity
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
      if (spreadSheetRow[SpreadSheetMovie.originalTitle]) {
        const existingMovie = this.movieQuery.existingMovie(spreadSheetRow[SpreadSheetMovie.internalRef]);
        const movie = {
          main: createMovieMain(),
          promotionalDescription: createMoviePromotionalDescription(),
          salesCast: createMovieSalesCast(),
          salesInfo: createMovieSalesInfo(),
          versionInfo: createMovieVersionInfo(),
          festivalPrizes: createMovieFestivalPrizes(),
          salesAgentDeal: createMovieSalesAgentDeal(),
          ... existingMovie ? JSON.parse(JSON.stringify(existingMovie)) : undefined // deep object clone to remove readonly setting
        } as Movie;

        movie.main.status = 'finished'; // all imported movies are in finished state
        const importErrors = { movie, errors: [] } as MovieImportState;

        //////////////////
        // REQUIRED FIELDS
        //////////////////

        // INTERNAL REF (Film Code)
        movie.main.internalRef = spreadSheetRow[SpreadSheetMovie.internalRef];

        // ORIGINAL TITLE (Original Title)
        if (spreadSheetRow[SpreadSheetMovie.originalTitle]) {
          movie.main.title.original = spreadSheetRow[SpreadSheetMovie.originalTitle];
        }

        // PRODUCTION YEAR
        if (!isNaN(Number(spreadSheetRow[SpreadSheetMovie.productionYear]))) {
          movie.main.productionYear = parseInt(spreadSheetRow[SpreadSheetMovie.productionYear], 10);
        }

        // SCORING (Scoring)
        if(spreadSheetRow[SpreadSheetMovie.scoring]) {
          const scoring = getCodeIfExists('SCORING', spreadSheetRow[SpreadSheetMovie.scoring]);
          if (scoring) {
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
        }

        // END OF RIGHTS (Mandate End of rights)
        if (spreadSheetRow[SpreadSheetMovie.rightsEnd]) {
          const rightsEnd: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetMovie.rightsEnd]);
          movie.salesAgentDeal.rightsEnd = new Date(`${rightsEnd.y}-${rightsEnd.m}-${rightsEnd.d}`);
        }

        // TERRITORIES (Mandate Territories)
        if (spreadSheetRow[SpreadSheetMovie.territories]) {
          movie.salesAgentDeal.territories = [];
          spreadSheetRow[SpreadSheetMovie.territories].split(',').forEach((c: string) => {
            const territory = getCodeIfExists('TERRITORIES', c);
            if (territory) {
              movie.salesAgentDeal.territories.push(territory);
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'salesAgentDeal.territories',
                name: "Mandate Territories",
                reason: 'Required field could not be parsed',
                hint: 'Edit corresponding sheet field.'
              } as SpreadsheetImportError);
            }
          });
        }

        // MEDIAS (Mandate Medias)
        if (spreadSheetRow[SpreadSheetMovie.medias]) {
          movie.salesAgentDeal.medias = [];
          spreadSheetRow[SpreadSheetMovie.medias].split(';').forEach((c: string) => {
            const media = getCodeIfExists('MEDIAS', c);
            if (media) {
              movie.salesAgentDeal.medias.push(media);
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'salesAgentDeal.medias',
                name: "Mandate Medias",
                reason: 'Required field could not be parsed',
                hint: 'Edit corresponding sheet field.'
              } as SpreadsheetImportError);
            }
          });
        }

        // DIRECTORS (Director(s))
        if (spreadSheetRow[SpreadSheetMovie.directors]) {
          movie.main.directors = [];
          spreadSheetRow[SpreadSheetMovie.directors].split(',').forEach((a: string) => {
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
        const data = await this.getImage(spreadSheetRow[SpreadSheetMovie.poster]);
        if (data !== false) {
          const snapshot = await this.afStorage.upload(`movies/${spreadSheetRow[SpreadSheetMovie.poster].split('/')[spreadSheetRow[SpreadSheetMovie.poster].split('/').length - 1]}`, data)
          const url = await snapshot.ref.getDownloadURL();
          movie.main.poster = url;
        }

        //////////////////
        // OPTIONAL FIELDS
        //////////////////

        // ISAN (ISAN Number)
        if(spreadSheetRow[SpreadSheetMovie.isan]) {
          movie.main.isan = spreadSheetRow[SpreadSheetMovie.isan];
        }
        
        // INTERNATIONAL TITLE (International Title)
        if(spreadSheetRow[SpreadSheetMovie.internationalTitle]) {
          movie.main.title.international = spreadSheetRow[SpreadSheetMovie.internationalTitle];
        }
        
        // LENGTH (Length)
        if (!isNaN(Number(spreadSheetRow[SpreadSheetMovie.length]))) {
          movie.main.length = parseInt(spreadSheetRow[SpreadSheetMovie.length], 10);
        }

        // PRODUCTION COMPANIES (Production Companie(s))
        if (spreadSheetRow[SpreadSheetMovie.productionCompanies]) {
          movie.main.productionCompanies = [];
          spreadSheetRow[SpreadSheetMovie.productionCompanies].split(',').forEach((p: string) => {
            movie.main.productionCompanies.push({ firstName: p });
          });
        }

        // BROADCASTER COPRODUCERS (TV / Platform coproducer(s))
        if (spreadSheetRow[SpreadSheetMovie.broadcasterCoproducers]) {
          movie.salesInfo.broadcasterCoproducers = [];
          spreadSheetRow[SpreadSheetMovie.broadcasterCoproducers].split(',').forEach((p: string) => {
            movie.salesInfo.broadcasterCoproducers.push(p);
          });
        }

        // COLOR (Color / Black & White )
        if(spreadSheetRow[SpreadSheetMovie.color]) {
          const color = getCodeIfExists('COLORS', spreadSheetRow[SpreadSheetMovie.color]);
          if (color) {
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
        }

        // ORIGIN COUNTRY (Country of Origin)
        if (spreadSheetRow[SpreadSheetMovie.originCountry]) {
          const country = getCodeIfExists('COUNTRIES', spreadSheetRow[SpreadSheetMovie.originCountry]);
          if (country) {
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
        if(spreadSheetRow[SpreadSheetMovie.europeanQualification]) {
          movie.salesInfo.europeanQualification = spreadSheetRow[SpreadSheetMovie.europeanQualification].toLowerCase() === 'yes' ? true : false;
        }

        // PEGI (Rating)
        if(spreadSheetRow[SpreadSheetMovie.rating]) {
          movie.salesInfo.pegi = spreadSheetRow[SpreadSheetMovie.rating];
        }

        // CERTIFICATIONS (Certifications)
        if (spreadSheetRow[SpreadSheetMovie.certifications]) {
          movie.salesInfo.certifications = [];
          spreadSheetRow[SpreadSheetMovie.certifications].split(',').forEach((c: string) => {
            const certification = getCodeIfExists('CERTIFICATIONS', c);
            if (certification) {
              movie.salesInfo.certifications.push(certification);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'salesInfo.certifications',
                name: "Certifications",
                reason: 'Optional field could not be parsed',
                hint: 'Edit corresponding sheet field.'
              } as SpreadsheetImportError);
            }
          });

        }

        // CREDITS (Principal Cast)
        if (spreadSheetRow[SpreadSheetMovie.cast]) {
          movie.salesCast.credits = [];
          spreadSheetRow[SpreadSheetMovie.cast].split(',').forEach((a: string) => {
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
        if(spreadSheetRow[SpreadSheetMovie.shortSynopsis]) {
          movie.main.shortSynopsis = spreadSheetRow[SpreadSheetMovie.shortSynopsis];
        }

        // INTERNATIONAL PREMIERE (International Premiere )
        if (spreadSheetRow[SpreadSheetMovie.internationalPremiere]) {
          if (spreadSheetRow[SpreadSheetMovie.internationalPremiere].split(',').length === 2 && !isNaN(Number(spreadSheetRow[SpreadSheetMovie.internationalPremiere].split(',')[1]))) {
            movie.salesInfo.internationalPremiere.name = spreadSheetRow[SpreadSheetMovie.internationalPremiere].split(',')[0];
            movie.salesInfo.internationalPremiere.year = Number(spreadSheetRow[SpreadSheetMovie.internationalPremiere].split(',')[1]);
          }
        }

        // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
        if (spreadSheetRow[SpreadSheetMovie.originCountryReleaseDate]) {
          const originCountryReleaseDate: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetMovie.originCountryReleaseDate]);
          movie.salesInfo.originCountryReleaseDate = new Date(`${originCountryReleaseDate.y}-${originCountryReleaseDate.m}-${originCountryReleaseDate.d}`);
        }

        // GENRES (Genres)
        if (spreadSheetRow[SpreadSheetMovie.genres]) {
          movie.main.genres = [];
          let errors = false;
          spreadSheetRow[SpreadSheetMovie.genres].split(',').forEach((g: string) => {
            const genre = getCodeIfExists('GENRES', g);
            if (genre) {
              movie.main.genres.push(genre);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'main.genres',
              name: "Genres",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // PRIZES (Prizes)
        if (spreadSheetRow[SpreadSheetMovie.festivalPrizes]) {
          movie.festivalPrizes.prizes = [];
          spreadSheetRow[SpreadSheetMovie.festivalPrizes].split(',').forEach((p: string) => {
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
        if (spreadSheetRow[SpreadSheetMovie.keyAssets]) {
          movie.promotionalDescription.keyAssets = [];
          spreadSheetRow[SpreadSheetMovie.keyAssets].split(',').forEach((k: string) => {
            movie.promotionalDescription.keyAssets.push(k);
          });
        }

        // KEYWORDS
        if (spreadSheetRow[SpreadSheetMovie.keywords]) {
          movie.promotionalDescription.keywords = [];
          spreadSheetRow[SpreadSheetMovie.keywords].split(',').forEach((k: string) => {
            movie.promotionalDescription.keywords.push(k);
          });
        }

        // LANGUAGES (Original Language(s))
        if (spreadSheetRow[SpreadSheetMovie.languages]) {
          let errors = false;
          movie.main.languages = [];
          spreadSheetRow[SpreadSheetMovie.languages].split(',').forEach((g: string) => {
            const language = getCodeIfExists('LANGUAGES', g);
            if (language) {
              movie.main.languages.push(language);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'main.languages',
              name: "Languages",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // DUBS (Available dubbing(s))
        if (spreadSheetRow[SpreadSheetMovie.dubbings]) {
          let errors = false;
          movie.versionInfo.dubbings = [];
          spreadSheetRow[SpreadSheetMovie.dubbings].split(',').forEach((g: string) => {
            const dubbing = getCodeIfExists('LANGUAGES', g);
            if (dubbing) {
              movie.versionInfo.dubbings.push(dubbing);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'versionInfo.dubbing',
              name: "Dubbings",
              reason: 'Optional field could not be parsed',
              hint: 'Edit corresponding sheet field.'
            } as SpreadsheetImportError);
          }
        }

        // SUBTILES (Available subtitle(s))
        if (spreadSheetRow[SpreadSheetMovie.subtitles]) {
          let errors = false;
          movie.versionInfo.subtitles = [];
          spreadSheetRow[SpreadSheetMovie.subtitles].split(',').forEach((g: string) => {
            const subtitle = getCodeIfExists('LANGUAGES', g);
            if (subtitle) {
              movie.versionInfo.subtitles.push(subtitle);
            } else {
              errors = true;
            }
          });

          if (errors) {
            importErrors.errors.push({
              type: 'warning',
              field: 'versionInfo.subtitle',
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
        field: 'main.internalRef',
        name: "Film Code ",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.title.original) {
      errors.push({
        type: 'error',
        field: 'main.title.original',
        name: "Original title",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.productionYear) {
      errors.push({
        type: 'error',
        field: 'main.productionYear',
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

    if (!movie.salesAgentDeal.rightsEnd) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.rightsEnd',
        name: 'Mandate End of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesAgentDeal.territories) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.territories',
        name: "Mandate Territories",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.salesAgentDeal.medias) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.medias',
        name: "Mandate Medias",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (movie.main.directors.length === 0) {
      errors.push({
        type: 'error',
        field: 'main.directors',
        name: "Directors",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      } as SpreadsheetImportError);
    }

    if (!movie.main.poster) {
      errors.push({
        type: 'error',
        field: 'main.poster',
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

    if (movie.salesInfo.europeanQualification === undefined) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.europeanQualification',
        name: 'European Qualification',
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

      if (spreadSheetRow[SpreadSheetSale.originalTitle]) {
        // @todo rework for #643
        const movie = this.movieQuery.existingMovie(spreadSheetRow[SpreadSheetSale.internalRef]);

        // @todo #643 handle errors
        const start: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetSale.start]);
        const end: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetSale.end]);

        const sale = {
          movieId: movie.id,
          movie,
          territories: spreadSheetRow[SpreadSheetSale.territories].split(','),
          rights: spreadSheetRow[SpreadSheetSale.rights] ? spreadSheetRow[SpreadSheetSale.rights].split(',') : [],
          start: new Date(`${start.y}-${start.m}-${start.d}`),
          end: new Date(`${end.y}-${end.m}-${end.d}`),
          languages: spreadSheetRow[SpreadSheetSale.languages] ? spreadSheetRow[SpreadSheetSale.languages].split(',') : [],
          exclusivity: spreadSheetRow[SpreadSheetSale.exclusivity] === 'Y' ? true : false,

        } as MovieAvailability;

        const importErrors = { sale, errors: [] } as SalesImportState;

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
