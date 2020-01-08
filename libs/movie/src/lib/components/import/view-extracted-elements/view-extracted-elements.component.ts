import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import {
  Movie,
  MovieQuery,
  createMovieMain,
  createMoviePromotionalDescription,
  createMovieSalesCast,
  createMovieSalesInfo,
  createMovieVersionInfo,
  createMovieFestivalPrizes,
  createMovieSalesAgentDeal,
  cleanModel,
  createPromotionalElement,
  createMovieBudget,
  createMoviePromotionalElements,
  createPrize,
  populateMovieLanguageSpecification
} from '../../../+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatCredits } from '@blockframes/utils/spreadsheet/format';
import { ImageUploader } from '@blockframes/utils';
import { SSF$Date } from 'ssf/types';
import { getCodeIfExists } from '../../../static-model/staticModels';
import { SSF } from 'xlsx';
import { OrganizationQuery } from '@blockframes/organization/+state/organization.query';
import { MovieLanguageTypes } from '@blockframes/movie/+state/movie.firestore';
import { createCredit, createParty } from '@blockframes/utils/common-interfaces/identity';
import { DistributionDeal, createDistributionDeal } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { Contract, createContract, validateContract } from '@blockframes/contract/+state/contract.model';
import { ContractStatus } from '@blockframes/contract/+state/contract.firestore';
import { LicenseStatus } from '@blockframes/movie/distribution-deals/+state/distribution-deal.firestore';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state/distribution-deal.service';

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

export interface DealsImportState {
  distributionDeal: DistributionDeal;
  errors?: SpreadsheetImportError[];
  movieTitle: String;
  movieInternalRef?: string;
  contract: Contract;
}

enum SpreadSheetMovie {
  internalRef,
  originalTitle,
  productionYear,
  scoring,
  rightsStart,
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
  originCountries,
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
  subtitles,
  screenerLink,
  promoReelLink,
  trailerLink,
  pitchTeaserLink,
  scenarioLink,
  productionStatus,
  budget,
  theatricalRelease,
  bannerLink,
  salesAgentName,
  salesAgentImage,
  reservedTerritories
}

enum SpreadSheetDistributionDeal {
  internalRef,
  internationalTitle, // unused
  licenseeName, // old operatorName
  displayLicenseeName, // old showOperatorName
  rightsStart,
  rightsEnd,
  territories,
  licenseType, // old medias
  dubbings,
  subtitles,
  exclusive,
  price
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
  public deals = new MatTableDataSource<DealsImportState>();
  private separator = ';';

  constructor(
    private movieQuery: MovieQuery,
    private distributionDealService: DistributionDealService,
    private organizationQuery: OrganizationQuery,
    private imageUploader: ImageUploader,
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
          promotionalElements: createMoviePromotionalElements(),
          salesCast: createMovieSalesCast(),
          salesInfo: createMovieSalesInfo(),
          versionInfo: createMovieVersionInfo(),
          festivalPrizes: createMovieFestivalPrizes(),
          salesAgentDeal: createMovieSalesAgentDeal(),
          budget: createMovieBudget(),
          ...existingMovie ? cleanModel(existingMovie) : undefined
        } as Movie;

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
        if (spreadSheetRow[SpreadSheetMovie.scoring]) {
          const scoring = getCodeIfExists('SCORING', spreadSheetRow[SpreadSheetMovie.scoring]);
          if (scoring) {
            movie.salesInfo.scoring = scoring;
          } else {
            importErrors.errors.push({
              type: 'error',
              field: 'salesInfo.scoring',
              name: "Scoring",
              reason: `${spreadSheetRow[SpreadSheetMovie.scoring]} not found in scoring list`,
              hint: 'Edit corresponding sheet field.'
            });

          }
        }

        // BEGINNING OF RIGHTS (Mandate beginning of rights)
        if (spreadSheetRow[SpreadSheetMovie.rightsStart]) {
          const rightsStart: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetMovie.rightsStart]);
          movie.salesAgentDeal.rights.from = new Date(`${rightsStart.y}-${rightsStart.m}-${rightsStart.d}`);
        }

        // END OF RIGHTS (Mandate End of rights)
        if (spreadSheetRow[SpreadSheetMovie.rightsEnd]) {
          const rightsEnd: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetMovie.rightsEnd]);
          movie.salesAgentDeal.rights.to = new Date(`${rightsEnd.y}-${rightsEnd.m}-${rightsEnd.d}`);
        }

        // TERRITORIES (Mandate Territories)
        // @todo #643 for territories: handle "World excl. USA, Japan, France, Germany and Belgium"
        if (spreadSheetRow[SpreadSheetMovie.territories]) {
          movie.salesAgentDeal.territories = [];
          spreadSheetRow[SpreadSheetMovie.territories].split(this.separator).forEach((c: string) => {
            const territory = getCodeIfExists('TERRITORIES', c);
            if (territory) {
              movie.salesAgentDeal.territories.push(territory);
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'salesAgentDeal.territories',
                name: "Mandate Territories",
                reason: `${c} not found in territories list`,
                hint: 'Edit corresponding sheet field.'
              });
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
                reason: `${c} not found in medias list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // DIRECTORS (Director(s))
        if (spreadSheetRow[SpreadSheetMovie.directors]) {
          movie.main.directors = formatCredits(spreadSheetRow[SpreadSheetMovie.directors], this.separator);
        }

        // POSTER (Poster)
        movie.main.poster = await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.poster]);

        //////////////////
        // OPTIONAL FIELDS
        //////////////////

        // ISAN (ISAN Number)
        if (spreadSheetRow[SpreadSheetMovie.isan]) {
          movie.main.isan = spreadSheetRow[SpreadSheetMovie.isan];
        }

        // INTERNATIONAL TITLE (International Title)
        if (spreadSheetRow[SpreadSheetMovie.internationalTitle]) {
          movie.main.title.international = spreadSheetRow[SpreadSheetMovie.internationalTitle];
        }

        // Total Run Time
        if (!isNaN(Number(spreadSheetRow[SpreadSheetMovie.length]))) {
          movie.main.totalRunTime = parseInt(spreadSheetRow[SpreadSheetMovie.length], 10);
        }

        // PRODUCTION COMPANIES (Production Companie(s))
        if (spreadSheetRow[SpreadSheetMovie.productionCompanies]) {
          movie.main.productionCompanies = [];
          spreadSheetRow[SpreadSheetMovie.productionCompanies].split(this.separator).forEach((p: string) => {
            movie.main.productionCompanies.push({ displayName: p });
          });
        }

        // BROADCASTER COPRODUCERS (TV / Platform coproducer(s))
        if (spreadSheetRow[SpreadSheetMovie.broadcasterCoproducers]) {
          movie.salesInfo.broadcasterCoproducers = [];
          spreadSheetRow[SpreadSheetMovie.broadcasterCoproducers].split(this.separator).forEach((p: string) => {
            movie.salesInfo.broadcasterCoproducers.push(p);
          });
        }

        // COLOR (Color / Black & White )
        if (spreadSheetRow[SpreadSheetMovie.color]) {
          const color = getCodeIfExists('COLORS', spreadSheetRow[SpreadSheetMovie.color]);
          if (color) {
            movie.salesInfo.color = color;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'salesInfo.color',
              name: "Color",
              reason: `${spreadSheetRow[SpreadSheetMovie.color]} not found in colors list`,
              hint: 'Edit corresponding sheet field.'
            });

          }
        }

        // ORIGIN COUNTRIES (Countries of Origin)
        if (spreadSheetRow[SpreadSheetMovie.originCountries]) {
          movie.main.originCountries = [];
          spreadSheetRow[SpreadSheetMovie.originCountries].split(this.separator).forEach((c: string) => {
            const country = getCodeIfExists('TERRITORIES', c);
            if (country) {
              movie.main.originCountries.push(country);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'main.originCountries',
                name: "Countries of origin",
                reason: `${c} not found in territories list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // CERTIFICATIONS (European Qualification)
        if (spreadSheetRow[SpreadSheetMovie.europeanQualification]) {
          movie.salesInfo.europeanQualification = spreadSheetRow[SpreadSheetMovie.europeanQualification].toLowerCase() === 'yes' ? true : false;
        }

        // PEGI (Rating)
        if (spreadSheetRow[SpreadSheetMovie.rating]) {
          movie.salesInfo.pegi = spreadSheetRow[SpreadSheetMovie.rating];
        }

        // CERTIFICATIONS (Certifications)
        if (spreadSheetRow[SpreadSheetMovie.certifications]) {
          movie.salesInfo.certifications = [];
          spreadSheetRow[SpreadSheetMovie.certifications].split(this.separator).forEach((c: string) => {
            const certification = getCodeIfExists('CERTIFICATIONS', c);
            if (certification) {
              movie.salesInfo.certifications.push(certification);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'salesInfo.certifications',
                name: "Certifications",
                reason: `${c} not found in certifications list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });

        }

        // CREDITS (Principal Cast)
        if (spreadSheetRow[SpreadSheetMovie.cast]) {
          movie.salesCast.credits = formatCredits(spreadSheetRow[SpreadSheetMovie.cast], this.separator)
            .map(credit => ({ ...credit, role: 'actor' }));
        }

        // SYNOPSIS (Short Synopsis)
        if (spreadSheetRow[SpreadSheetMovie.shortSynopsis]) {
          movie.main.shortSynopsis = spreadSheetRow[SpreadSheetMovie.shortSynopsis];
        }

        // INTERNATIONAL PREMIERE (International Premiere )
        if (spreadSheetRow[SpreadSheetMovie.internationalPremiere]) {
          if (spreadSheetRow[SpreadSheetMovie.internationalPremiere].split(this.separator).length === 2 && !isNaN(Number(spreadSheetRow[SpreadSheetMovie.internationalPremiere].split(',')[1]))) {
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
          spreadSheetRow[SpreadSheetMovie.genres].split(this.separator).forEach((g: string) => {
            const genre = getCodeIfExists('GENRES', g);
            if (genre) {
              movie.main.genres.push(genre);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'main.genres',
                name: "Genres",
                reason: `${g} not found in genres list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // PRIZES (Prizes)
        if (spreadSheetRow[SpreadSheetMovie.festivalPrizes]) {
          movie.festivalPrizes.prizes = [];
          spreadSheetRow[SpreadSheetMovie.festivalPrizes].split(this.separator).forEach(async (p: string) => {
            if (p.split(',').length >= 3) {
              const prize = createPrize();
              prize.name = p.split(',')[0];
              prize.year = parseInt(p.split(',')[1], 10);
              prize.prize = p.split(',')[2];
              if (p.split(',').length >= 4) {
                prize.logo = await this.imageUploader.upload(p.split(',')[3].trim());
              }
              movie.festivalPrizes.prizes.push(prize);
            }
          });
        }

        // KEY ASSETS (Key Assets)
        if (spreadSheetRow[SpreadSheetMovie.keyAssets]) {
          movie.promotionalDescription.keyAssets = [];
          spreadSheetRow[SpreadSheetMovie.keyAssets].split(this.separator).forEach((k: string) => {
            movie.promotionalDescription.keyAssets.push(k);
          });
        }

        // KEYWORDS
        if (spreadSheetRow[SpreadSheetMovie.keywords]) {
          movie.promotionalDescription.keywords = [];
          spreadSheetRow[SpreadSheetMovie.keywords].split(this.separator).forEach((k: string) => {
            movie.promotionalDescription.keywords.push(k);
          });
        }

        // LANGUAGES (Original Language(s))
        if (spreadSheetRow[SpreadSheetMovie.languages]) {
          movie.main.languages = [];
          spreadSheetRow[SpreadSheetMovie.languages].split(this.separator).forEach((g: string) => {
            const language = getCodeIfExists('LANGUAGES', g);
            if (language) {
              movie.main.languages.push(language);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'main.languages',
                name: "Languages",
                reason: `${g} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // DUBS (Available dubbing(s))
        if (spreadSheetRow[SpreadSheetMovie.dubbings]) {
          movie.versionInfo.dubbings = [];
          spreadSheetRow[SpreadSheetMovie.dubbings].split(this.separator).forEach((g: string) => {
            const dubbing = getCodeIfExists('LANGUAGES', g);
            if (dubbing) {
              movie.versionInfo.dubbings.push(dubbing);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'versionInfo.dubbing',
                name: "Dubbings",
                reason: `${g} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // SUBTILES (Available subtitle(s))
        if (spreadSheetRow[SpreadSheetMovie.subtitles]) {
          movie.versionInfo.subtitles = [];
          spreadSheetRow[SpreadSheetMovie.subtitles].split(this.separator).forEach((g: string) => {
            const subtitle = getCodeIfExists('LANGUAGES', g);
            if (subtitle) {
              movie.versionInfo.subtitles.push(subtitle);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'versionInfo.subtitle',
                name: "Subtitles",
                reason: `${g} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // SCREENER LINK
        if (spreadSheetRow[SpreadSheetMovie.screenerLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Screener link',
            media: spreadSheetRow[SpreadSheetMovie.screenerLink],
            type: 'screener'
          });

          movie.promotionalElements.promotionalElements.push(promotionalElement);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Screener link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // PROMO REEL LINK
        if (spreadSheetRow[SpreadSheetMovie.promoReelLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Promo reel link',
            media: spreadSheetRow[SpreadSheetMovie.promoReelLink],
            type: 'reel'
          });

          movie.promotionalElements.promotionalElements.push(promotionalElement);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Promo reel link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // TRAILER LINK
        if (spreadSheetRow[SpreadSheetMovie.trailerLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Trailer link',
            media: spreadSheetRow[SpreadSheetMovie.trailerLink],
            type: 'trailer'
          });

          movie.promotionalElements.promotionalElements.push(promotionalElement);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Trailer link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // PITCH TEASER LINK
        if (spreadSheetRow[SpreadSheetMovie.pitchTeaserLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Pitch teaser link',
            media: spreadSheetRow[SpreadSheetMovie.pitchTeaserLink],
            type: 'teaser'
          });

          movie.promotionalElements.promotionalElements.push(promotionalElement);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Pitch teaser link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // SCENARIO LINK
        if (spreadSheetRow[SpreadSheetMovie.scenarioLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Scenario link',
            media: spreadSheetRow[SpreadSheetMovie.scenarioLink],
            type: 'scenario'
          });

          movie.promotionalElements.promotionalElements.push(promotionalElement);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Scenario link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // PRODUCTION STATUS
        if (spreadSheetRow[SpreadSheetMovie.productionStatus]) {
          movie.main.status = spreadSheetRow[SpreadSheetMovie.productionStatus];
        } else {
          movie.main.status = 'finished';
        }

        // BUDGET
        if (spreadSheetRow[SpreadSheetMovie.budget]) {
          movie.budget.totalBudget = spreadSheetRow[SpreadSheetMovie.budget];
        }

        // THEATRICAL RELEASE
        if (spreadSheetRow[SpreadSheetMovie.theatricalRelease]) {
          movie.salesInfo.theatricalRelease = spreadSheetRow[SpreadSheetMovie.theatricalRelease].toLowerCase() === 'yes' ? true : false;
        }

        // IMAGE BANNIERE LINK
        if (spreadSheetRow[SpreadSheetMovie.bannerLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Banner link',
            media: await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.bannerLink]),
            type: 'banner',
            ratio: 'rectangle'
          });

          movie.promotionalElements.promotionalElements.push(promotionalElement);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Banner link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // SALES AGENT (name)
        const salesAgent = createCredit();
        if (spreadSheetRow[SpreadSheetMovie.salesAgentName]) {
          salesAgent.displayName = spreadSheetRow[SpreadSheetMovie.salesAgentName];
        }

        // SALES AGENT (avatar)
        if (spreadSheetRow[SpreadSheetMovie.salesAgentImage]) {
          salesAgent.avatar = await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.salesAgentImage]);
        }

        movie.salesAgentDeal.salesAgent = salesAgent;

        // RESERVED TERRITORIES
        if (spreadSheetRow[SpreadSheetMovie.reservedTerritories]) {
          movie.salesAgentDeal.reservedTerritories = spreadSheetRow[SpreadSheetMovie.reservedTerritories].split(this.separator);
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
      });
    }

    if (!movie.main.title.original) {
      errors.push({
        type: 'error',
        field: 'main.title.original',
        name: "Original title",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.productionYear) {
      errors.push({
        type: 'error',
        field: 'main.productionYear',
        name: "Production Year",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.scoring) {
      errors.push({
        type: 'error',
        field: 'salesInfo.scoring',
        name: "Scoring",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesAgentDeal.rights.from) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.rights.from',
        name: 'Mandate Beginning of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesAgentDeal.rights.to) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.rights.to',
        name: 'Mandate End of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesAgentDeal.territories) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.territories',
        name: "Mandate Territories",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesAgentDeal.medias) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.medias',
        name: "Mandate Medias",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.directors.length === 0) {
      errors.push({
        type: 'error',
        field: 'main.directors',
        name: "Directors",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.poster) {
      errors.push({
        type: 'error',
        field: 'main.poster',
        name: "Poster",
        reason: 'Required field is missing',
        hint: 'Add poster URL in corresponding column.'
      });
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
      });
    }

    if (!movie.main.title.international) {
      errors.push({
        type: 'warning',
        field: 'main.title.international',
        name: "International title",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.totalRunTime) {
      errors.push({
        type: 'warning',
        field: 'main.totalRunTime',
        name: "Total Run Time",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.productionCompanies.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.productionCompanies',
        name: "Production Companie(s)",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesInfo.broadcasterCoproducers.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.salesInfo.broadcasterCoproducers',
        name: "TV / Platform coproducer(s)",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.color) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.color',
        name: "Color / Black & White ",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.originCountries.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.originCountries',
        name: "Countries of origin",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.certifications) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.certifications',
        name: "Certifications",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesInfo.europeanQualification === undefined) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.europeanQualification',
        name: 'European Qualification',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.pegi) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.pegi',
        name: 'Rating',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesCast.credits.length === 0) {
      errors.push({
        type: 'warning',
        field: 'salesCast.credits',
        name: "Principal Cast",
        reason: 'Optional fields are missing',
        hint: 'Edit corresponding sheets fields: directors, principal cast.'
      });
    }

    if (!movie.main.shortSynopsis) {
      errors.push({
        type: 'warning',
        field: 'main.shortSynopsis',
        name: "Synopsis",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.internationalPremiere) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.internationalPremiere',
        name: "International Premiere",
        reason: 'Optional field is missing or could not be parsed',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.originCountryReleaseDate) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.originCountryReleaseDate',
        name: 'Release date in Origin Country',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.genres.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.genres',
        name: "Genres",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.festivalPrizes.prizes.length === 0) {
      errors.push({
        type: 'warning',
        field: 'festivalPrizes.prizes',
        name: "Festival Prizes",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.promotionalDescription.keyAssets.length === 0) {
      errors.push({
        type: 'warning',
        field: 'promotionalDescription.keyAssets',
        name: "Key assets",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.promotionalDescription.keywords.length === 0) {
      errors.push({
        type: 'warning',
        field: 'promotionalDescription.keywords',
        name: "Keywords",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.languages.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.languages',
        name: "Languages",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.versionInfo.dubbings.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.dubbings',
        name: "Dubbings",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.versionInfo.subtitles.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.subtitles',
        name: "Subtitles",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.budget.totalBudget === undefined) {
      errors.push({
        type: 'warning',
        field: 'budget.totalBudget',
        name: 'Budget',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesInfo.theatricalRelease === undefined) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.theatricalRelease',
        name: 'Theatrical release',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesAgentDeal.salesAgent === undefined) {
      errors.push({
        type: 'warning',
        field: 'salesAgentDeal.salesAgent',
        name: 'Sales agent',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesAgentDeal.reservedTerritories.length === 0) {
      errors.push({
        type: 'warning',
        field: 'salesAgentDeal.reservedTerritories',
        name: 'Reserved territories',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    return importErrors;
  }


  public formatDistributionDeals(sheetTab: SheetTab) {
    this.clearDataSources();
    sheetTab.rows.forEach(async spreadSheetRow => {

      if (spreadSheetRow[SpreadSheetDistributionDeal.internalRef]) {

        const movie = this.movieQuery.existingMovie(spreadSheetRow[SpreadSheetDistributionDeal.internalRef]);
        const distributionDeal = createDistributionDeal();
        // Create the contract that will handle the deal
        const contract = createContract();
        contract.status = ContractStatus.accepted;

        const importErrors = {
          distributionDeal,
          contract,
          errors: [],
          movieInternalRef: spreadSheetRow[SpreadSheetDistributionDeal.internalRef],
          movieTitle: movie ? movie.main.title.original : undefined
        } as DealsImportState;

        if (movie) {
          /////////////////
          // LICENSE STUFF
          /////////////////

          /* LICENSOR */

          // @TODO #1388 Cascade8 will be the licensor for imported movies. Update this if needed
          const licensor = createParty();
          licensor.role = 'licensor';
          licensor.orgId = this.organizationQuery.getActiveId();
          licensor.displayName = 'licensor display name example';
          licensor.showName = true;
          contract.parties.push(licensor);

          /* LICENSEE */

          const licensee = createParty();
          licensee.role = 'licensee';

          // DISPLAY NAME
          if (spreadSheetRow[SpreadSheetDistributionDeal.licenseeName]) {
            licensee.displayName = spreadSheetRow[SpreadSheetDistributionDeal.licenseeName];
          }

          // SHOW NAME
          if (spreadSheetRow[SpreadSheetDistributionDeal.displayLicenseeName]) {
            licensee.showName = spreadSheetRow[SpreadSheetDistributionDeal.displayLicenseeName].toLowerCase() === 'yes' ? true : false;
          }

          contract.parties.push(licensee);

          /* LICENSE STATUS */
          distributionDeal.licenseStatus = LicenseStatus.paid;

          /////////////////
          // TERMS STUFF
          /////////////////

          // BEGINNING OF RIGHTS
          if (spreadSheetRow[SpreadSheetDistributionDeal.rightsStart]) {
            const rightsStart: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.rightsStart]);
            distributionDeal.terms.start = new Date(`${rightsStart.y}-${rightsStart.m}-${rightsStart.d}`);
          }

          // END OF RIGHTS
          if (spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd]) {
            const rightsEnd: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd]);
            distributionDeal.terms.end = new Date(`${rightsEnd.y}-${rightsEnd.m}-${rightsEnd.d}`);
          }

          // TERRITORIES (Mandate Territories)
          if (spreadSheetRow[SpreadSheetDistributionDeal.territories]) {
            distributionDeal.territory = [];
            spreadSheetRow[SpreadSheetDistributionDeal.territories].split(this.separator).forEach((c: string) => {
              const territory = getCodeIfExists('TERRITORIES', c);
              if (territory) {
                distributionDeal.territory.push(territory);
              } else {
                importErrors.errors.push({
                  type: 'error',
                  field: 'territories',
                  name: "Territories sold",
                  reason: `${c} not found in territories list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            });
          }

          // MEDIAS (Mandate Medias)
          if (spreadSheetRow[SpreadSheetDistributionDeal.licenseType]) {
            distributionDeal.licenseType = [];
            spreadSheetRow[SpreadSheetDistributionDeal.licenseType].split(this.separator).forEach((c: string) => {
              const media = getCodeIfExists('MEDIAS', c);
              if (media) {
                distributionDeal.licenseType.push(media);
              } else {
                importErrors.errors.push({
                  type: 'error',
                  field: 'medias',
                  name: "Media(s)",
                  reason: `${c} not found in medias list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            });
          }

          // DUBS (Authorized language(s))
          if (spreadSheetRow[SpreadSheetDistributionDeal.dubbings]) {
            spreadSheetRow[SpreadSheetDistributionDeal.dubbings].split(this.separator).forEach((g: string) => {
              const dubbing = getCodeIfExists('LANGUAGES', g);
              if (dubbing) {
                distributionDeal.assetLanguage = populateMovieLanguageSpecification(
                  distributionDeal.assetLanguage,
                  dubbing,
                  MovieLanguageTypes.dubbed
                );
              } else {
                importErrors.errors.push({
                  type: 'error',
                  field: 'dubbing',
                  name: "Authorized language(s)",
                  reason: `${g} not found in languages list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            });

          }

          // SUBTILES (Available subtitle(s))
          if (spreadSheetRow[SpreadSheetDistributionDeal.subtitles]) {
            spreadSheetRow[SpreadSheetDistributionDeal.subtitles].split(this.separator).forEach((g: string) => {
              const subtitle = getCodeIfExists('LANGUAGES', g);
              if (!!subtitle) {
                distributionDeal.assetLanguage = populateMovieLanguageSpecification(
                  distributionDeal.assetLanguage,
                  subtitle,
                  MovieLanguageTypes.subtitle
                );
              } else {
                importErrors.errors.push({
                  type: 'error',
                  field: 'subtitle',
                  name: "Authorized subtitle(s)",
                  reason: `${g} not found in languages list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            });

          }

          // EXCLUSIVE DEAL
          if (spreadSheetRow[SpreadSheetDistributionDeal.exclusive]) {
            distributionDeal.exclusive = spreadSheetRow[SpreadSheetDistributionDeal.exclusive].toLowerCase() === 'yes' ? true : false;
          }

          // PRICE
          if (!isNaN(Number(spreadSheetRow[SpreadSheetDistributionDeal.price]))) {
            contract.price.amount = parseInt(spreadSheetRow[SpreadSheetDistributionDeal.price], 10);
          }

          // Checks if sale already exists
          if (await this.distributionDealService.existingDistributionDeal(movie.id, distributionDeal)) {
            importErrors.errors.push({
              type: 'error',
              field: 'distributionDeal',
              name: 'Distribution deal',
              reason: 'Distribution deal already added',
              hint: 'Distribution deal already added'
            });
          }

        } else {
          importErrors.errors.push({
            type: 'error',
            field: 'internalRef',
            name: "Movie",
            reason: 'Movie not found',
            hint: 'Try importing it first or check if data is correct.'
          });
        }

        const saleWithErrors = this.validateMovieSale(importErrors);
        this.deals.data.push(saleWithErrors);
        this.deals.data = [... this.deals.data];

      }

    });
  }

  private validateMovieSale(importErrors: DealsImportState): DealsImportState {
    const distributionDeal = importErrors.distributionDeal;
    const contract = importErrors.contract;
    const errors = importErrors.errors;

    // No movie found
    if (!importErrors.movieTitle) {
      return importErrors;
    }

    //////////////////
    // REQUIRED FIELDS
    //////////////////

    //  CONTRACT VALIDATION
    if(!validateContract(contract)) {
      errors.push({
        type: 'error',
        field: 'contractId',
        name: "Operator name | Do you want to show the operator name on a buyer research ? ",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }


    // BEGINNING OF RIGHTS
    if (!distributionDeal.terms.start) {
      errors.push({
        type: 'error',
        field: 'rights.from',
        name: 'Beginning of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // END OF RIGHTS
    if (!distributionDeal.terms.end) {
      errors.push({
        type: 'error',
        field: 'rights.to',
        name: 'End of rights',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // TERRITORIES
    if (!distributionDeal.territory) {
      errors.push({
        type: 'error',
        field: 'territory',
        name: "Territories sold",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // LICENSE TYPE
    if (!distributionDeal.licenseType) {
      errors.push({
        type: 'error',
        field: 'medias',
        name: "Media(s)",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // DUBBINGS
    if (!Object.keys(distributionDeal.assetLanguage).length) {
      errors.push({
        type: 'error',
        field: 'dubbings',
        name: "Authorized language(s)",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // EXCLUSIVE
    if (distributionDeal.exclusive === undefined) {
      errors.push({
        type: 'error',
        field: 'exclusive',
        name: "Exclusive deal",
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    //////////////////
    // OPTIONAL FIELDS
    //////////////////

    // CONTRACT PRICE VALIDATION
    if (!contract.price.amount) {
      errors.push({
        type: 'warning',
        field: 'price',
        name: "Distribution deal price",
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    return importErrors;
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
    this.deals.data = [];
  }
}
