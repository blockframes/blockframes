import { Component, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import {
  Movie,
  createMovieMain,
  createMoviePromotionalDescription,
  createMovieSalesCast,
  createMovieSalesInfo,
  createMovieVersionInfo,
  createMovieFestivalPrizes,
  createMovieSalesAgentDeal,
  createPromotionalElement,
  createMovieBudget,
  createMoviePromotionalElements,
  createPrize,
  populateMovieLanguageSpecification,
  MovieService,
  createMovieRating,
  createMovieOriginalRelease
} from '../../../+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatCredits } from '@blockframes/utils/spreadsheet/format';
import { ImageUploader, cleanModel } from '@blockframes/utils';
import { SSF$Date } from 'ssf/types';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { SSF } from 'xlsx';
import { MovieLanguageTypes, PremiereType } from '@blockframes/movie/movie/+state/movie.firestore';
import { createCredit, createStakeholder } from '@blockframes/utils/common-interfaces/identity';
import { DistributionDeal, createDistributionDeal, createHoldback } from '@blockframes/movie/distribution-deals/+state/distribution-deal.model';
import { createContractPartyDetail, createContractTitleDetail, Contract, initContractWithVersion, ContractWithLastVersion } from '@blockframes/contract/+state/contract.model';
import { ContractStatus, ContractTitleDetail } from '@blockframes/contract/+state/contract.firestore';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state/distribution-deal.service';
import { createFee } from '@blockframes/utils/common-interfaces/price';
import { ContractService } from '@blockframes/contract/+state/contract.service';
import { createPaymentSchedule } from '@blockframes/utils/common-interfaces/schedule';
import { createTerms } from '@blockframes/utils/common-interfaces';

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
  movieId: string;
  contract: ContractWithLastVersion;
}

export interface ContractsImportState {
  errors?: SpreadsheetImportError[];
  newContract: boolean;
  contract: ContractWithLastVersion;
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
  stakeholdersWithRole,
  color,
  originCountries,
  europeanQualification,
  rating,
  certifications,
  cast,
  shortSynopsis,
  originCountryReleaseDate,
  genres,
  festivalPrizes,
  keyAssets,
  keywords,
  languages,
  dubbings,
  subtitles,
  captions,
  screenerLink,
  promoReelLink,
  trailerLink,
  pitchTeaserLink,
  scenarioLink,
  productionStatus,
  budget,
  bannerLink,
  salesAgentName,
  salesAgentImage,
  reservedTerritories
}

enum SpreadSheetDistributionDeal {
  internalRef,
  distributionDealId,
  internationalTitle, // unused
  licensorName, // unused
  licenseeName, // unused
  displayLicenseeName,
  rightsStart,
  rightsEnd,
  territories,
  territoriesExcluded,
  licenseType,
  dubbings,
  subtitles,
  captions,
  exclusive,
  priceAmount,
  priceCurrency,
  catchUpStartDate,
  catchUpEndDate,
  multidiffusion,
  holdbacks
}

enum SpreadSheetContract {
  licensors,
  licensee,
  childRoles,
  contractId,
  parentContractIds,
  childContractIds,
  status,
  creationDate,
  scopeStartDate,
  scopeEndDate,
  paymentSchedules,
  titleStuffIndexStart,
}

enum SpreadSheetContractTitle {
  titleCode, // ie: filmCode
  licensedRightIds, // ie: distributionDealIds @see #1388
  commission,
  feeLabel,
  feeValue,
  feeCurrency,
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
  public contractsToUpdate = new MatTableDataSource<ContractsImportState>();
  public contractsToCreate = new MatTableDataSource<ContractsImportState>();
  private separator = ';';
  private subSeparator = ',';

  constructor(
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private distributionDealService: DistributionDealService,
    private contractService: ContractService,
    private imageUploader: ImageUploader,
    private cdRef: ChangeDetectorRef
  ) { }

  public formatMovies(sheetTab: SheetTab) {
    this.clearDataSources();

    sheetTab.rows.forEach(async spreadSheetRow => {
      if (spreadSheetRow[SpreadSheetMovie.originalTitle]) {
        const existingMovie = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetMovie.internalRef]);
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
              name: 'Scoring',
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
        if (spreadSheetRow[SpreadSheetMovie.territories]) {
          movie.salesAgentDeal.territories = [];
          spreadSheetRow[SpreadSheetMovie.territories].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
            const territory = getCodeIfExists('TERRITORIES', c);
            if (territory) {
              movie.salesAgentDeal.territories.push(territory);
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'salesAgentDeal.territories',
                name: 'Mandate Territories',
                reason: `${c} not found in territories list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // MEDIAS (Mandate Medias)
        if (spreadSheetRow[SpreadSheetMovie.medias]) {
          movie.salesAgentDeal.medias = [];
          spreadSheetRow[SpreadSheetMovie.medias].split(';').forEach((c: ExtractCode<'MEDIAS'>) => {
            const media = getCodeIfExists('MEDIAS', c);
            if (media) {
              movie.salesAgentDeal.medias.push(media);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'salesAgentDeal.medias',
                name: 'Mandate Medias',
                reason: `${c} not found in medias list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // DIRECTORS (Director(s))
        if (spreadSheetRow[SpreadSheetMovie.directors]) {
          movie.main.directors = formatCredits(spreadSheetRow[SpreadSheetMovie.directors], this.separator, this.subSeparator);
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
        if (spreadSheetRow[SpreadSheetMovie.length]) {
          if (!isNaN(Number(spreadSheetRow[SpreadSheetMovie.length]))) {
            movie.main.totalRunTime = parseInt(spreadSheetRow[SpreadSheetMovie.length], 10);
          } else {
            movie.main.totalRunTime = spreadSheetRow[SpreadSheetMovie.length]; // Exemple value: TBC
          }
        }

        // PRODUCTION COMPANIES (Production Companie(s))
        if (spreadSheetRow[SpreadSheetMovie.stakeholdersWithRole]) {
          movie.main.stakeholders = [];
          spreadSheetRow[SpreadSheetMovie.stakeholdersWithRole].split(this.separator).forEach((p: string) => {
            const stakeHolderParts = p.split(this.subSeparator);
            const stakeHolder = createStakeholder({ displayName: stakeHolderParts[0] });
            const role = getCodeIfExists('STAKEHOLDER_ROLES', stakeHolderParts[1] as ExtractCode<'STAKEHOLDER_ROLES'>);
            if (role) {
              stakeHolder.role = role;
            }

            movie.main.stakeholders.push(stakeHolder);
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
              name: 'Color',
              reason: `${spreadSheetRow[SpreadSheetMovie.color]} not found in colors list`,
              hint: 'Edit corresponding sheet field.'
            });

          }
        }

        // ORIGIN COUNTRIES (Countries of Origin)
        if (spreadSheetRow[SpreadSheetMovie.originCountries]) {
          movie.main.originCountries = [];
          spreadSheetRow[SpreadSheetMovie.originCountries].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
            const country = getCodeIfExists('TERRITORIES', c);
            if (country) {
              movie.main.originCountries.push(country);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'main.originCountries',
                name: 'Countries of origin',
                reason: `${c} not found in territories list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // CERTIFICATIONS (European Qualification)
        movie.salesInfo.certifications = [];
        if (spreadSheetRow[SpreadSheetMovie.europeanQualification] &&
          spreadSheetRow[SpreadSheetMovie.europeanQualification].toLowerCase() === 'yes') {
          const certification = getCodeIfExists('CERTIFICATIONS', 'europeanQualification');
          if (certification) {
            movie.salesInfo.certifications.push(certification);
          }
        }

        // PEGI (Rating)
        if (spreadSheetRow[SpreadSheetMovie.rating]) {
          spreadSheetRow[SpreadSheetMovie.rating].split(this.separator).forEach((r: string) => {
            const ratingParts = r.split(this.subSeparator);
            const country = getCodeIfExists('TERRITORIES', ratingParts[0] as ExtractCode<'TERRITORIES'>);
            const movieRating = createMovieRating({ value: ratingParts[1] });
            if (country) {
              movieRating.country = country;
            }

            movie.salesInfo.rating.push(movieRating);
          });
        }

        // CERTIFICATIONS (Certifications)
        if (spreadSheetRow[SpreadSheetMovie.certifications]) {
          spreadSheetRow[SpreadSheetMovie.certifications].split(this.separator).forEach((c: ExtractCode<'CERTIFICATIONS'>) => {
            const certification = getCodeIfExists('CERTIFICATIONS', c);
            if (certification) {
              movie.salesInfo.certifications.push(certification);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'salesInfo.certifications',
                name: 'Certifications',
                reason: `${c} not found in certifications list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });

        }

        // CREDITS (Principal Cast)
        if (spreadSheetRow[SpreadSheetMovie.cast]) {
          movie.salesCast.cast = formatCredits(spreadSheetRow[SpreadSheetMovie.cast], this.separator)
            .map(credit => ({ ...credit, role: 'actor' }));
        }

        // SYNOPSIS (Short Synopsis)
        if (spreadSheetRow[SpreadSheetMovie.shortSynopsis]) {
          movie.main.shortSynopsis = spreadSheetRow[SpreadSheetMovie.shortSynopsis];
        }

        // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
        if (spreadSheetRow[SpreadSheetMovie.originCountryReleaseDate]) {

          spreadSheetRow[SpreadSheetMovie.originCountryReleaseDate].split(this.separator).forEach((o: ExtractCode<'TERRITORIES'>) => {
            const originalReleaseParts = o.split(this.subSeparator);
            const originalRelease = createMovieOriginalRelease({ date: originalReleaseParts[2] });
            const country = getCodeIfExists('TERRITORIES', originalReleaseParts[0] as ExtractCode<'TERRITORIES'>);
            if (country) {
              originalRelease.country = country;
            }

            const media = getCodeIfExists('MEDIAS', originalReleaseParts[1] as ExtractCode<'MEDIAS'>);
            if (media) {
              originalRelease.media = media;
            }


            movie.salesInfo.originalRelease.push(originalRelease);
          });
        }

        // GENRES (Genres)
        if (spreadSheetRow[SpreadSheetMovie.genres]) {
          movie.main.genres = [];
          spreadSheetRow[SpreadSheetMovie.genres].split(this.separator).forEach((g: ExtractCode<'GENRES'>) => {
            const genre = getCodeIfExists('GENRES', g);
            if (genre) {
              movie.main.genres.push(genre);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'main.genres',
                name: 'Genres',
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
            const prizeParts = p.split(this.subSeparator);
            if (prizeParts.length >= 3) {
              const prize = createPrize();
              prize.name = prizeParts[0];
              prize.year = parseInt(prizeParts[1], 10);
              prize.prize = prizeParts[2];
              if (prizeParts.length >= 4) {
                switch (prizeParts[3].trim()) {
                  case 'International Premiere':
                    prize.premiere = PremiereType.international;
                    break;
                  default:
                    prize.premiere = PremiereType[prizeParts[3].trim().toLowerCase()];
                    break;
                }

              }
              if (prizeParts.length >= 5) {
                prize.logo = await this.imageUploader.upload(prizeParts[4].trim());
              }
              movie.festivalPrizes.prizes.push(prize);
            }
          });
        }

        // KEY ASSETS (Key Assets)
        if (spreadSheetRow[SpreadSheetMovie.keyAssets]) {
          movie.promotionalDescription.keyAssets = spreadSheetRow[SpreadSheetMovie.keyAssets];
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
          movie.main.originalLanguages = []; // @todo #1562 add to movie.versionInfo & check #1589
          spreadSheetRow[SpreadSheetMovie.languages].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
            const language = getCodeIfExists('LANGUAGES', g);
            if (language) {
              movie.main.originalLanguages.push(language);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'main.originalLanguages',
                name: 'Languages',
                reason: `${g} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // DUBS (Available dubbing(s))
        // @todo #1562 Wait for  #1411
        if (spreadSheetRow[SpreadSheetMovie.dubbings]) {
          movie.versionInfo.dubbings = [];
          spreadSheetRow[SpreadSheetMovie.dubbings].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
            const dubbing = getCodeIfExists('LANGUAGES', g);
            if (dubbing) {
              movie.versionInfo.dubbings.push(dubbing);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'versionInfo.dubbing',
                name: 'Dubbings',
                reason: `${g} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // SUBTILES (Available subtitle(s))
        // @todo #1562 Wait for  #1411
        if (spreadSheetRow[SpreadSheetMovie.subtitles]) {
          movie.versionInfo.subtitles = [];
          spreadSheetRow[SpreadSheetMovie.subtitles].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
            const subtitle = getCodeIfExists('LANGUAGES', g);
            if (subtitle) {
              movie.versionInfo.subtitles.push(subtitle);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'versionInfo.subtitle',
                name: 'Subtitles',
                reason: `${g} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // Captions (Avalaible closed-captioned)
        if (spreadSheetRow[SpreadSheetMovie.captions]) {
          //movie.versionInfo.captions = [];
          spreadSheetRow[SpreadSheetMovie.captions].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
            const caption = getCodeIfExists('LANGUAGES', g);
            if (caption) {
              // @todo #1562 Wait for  #1411
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'versionInfo.subtitle',
                name: 'Subtitles',
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
          });
          movie.promotionalElements.screener_link = promotionalElement;
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
          });

          movie.promotionalElements.promo_reel_link = promotionalElement;
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
          });

          movie.promotionalElements.trailer_link = promotionalElement;
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
          });

          movie.promotionalElements.teaser_link = promotionalElement;
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
          });

          movie.promotionalElements.scenario = promotionalElement;
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
          const movieStatus = getCodeIfExists('MOVIE_STATUS', spreadSheetRow[SpreadSheetMovie.productionStatus]);
          if (movieStatus) {
            movie.main.status = movieStatus;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.main.status',
              name: 'Production status',
              reason: 'Production status could not be parsed',
              hint: 'Edit corresponding sheet field.'
            });
          }
        } else {
          movie.main.status = getCodeIfExists('MOVIE_STATUS', 'finished');
          importErrors.errors.push({
            type: 'warning',
            field: 'movie.main.status',
            name: 'Production status',
            reason: 'Production status not found, assumed "Completed"',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // BUDGET
        if (spreadSheetRow[SpreadSheetMovie.budget]) {
          movie.budget.totalBudget = spreadSheetRow[SpreadSheetMovie.budget];
        }

        // IMAGE BANNIERE LINK
        if (spreadSheetRow[SpreadSheetMovie.bannerLink]) {
          const promotionalElement = createPromotionalElement({
            label: 'Banner',
            media: await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.bannerLink]),
            ratio: 'rectangle'
          });

          movie.promotionalElements.banner = promotionalElement;
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Banner',
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
        name: 'Film Code ',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.title.original) {
      errors.push({
        type: 'error',
        field: 'main.title.original',
        name: 'Original title',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.productionYear) {
      errors.push({
        type: 'error',
        field: 'main.productionYear',
        name: 'Production Year',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.scoring) {
      errors.push({
        type: 'error',
        field: 'salesInfo.scoring',
        name: 'Scoring',
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
        name: 'Mandate Territories',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesAgentDeal.medias) {
      errors.push({
        type: 'error',
        field: 'salesAgentDeal.medias',
        name: 'Mandate Medias',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.directors.length === 0) {
      errors.push({
        type: 'error',
        field: 'main.directors',
        name: 'Directors',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.poster) {
      errors.push({
        type: 'error',
        field: 'main.poster',
        name: 'Poster',
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
        name: 'ISAN number',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.title.international) {
      errors.push({
        type: 'warning',
        field: 'main.title.international',
        name: 'International title',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.main.totalRunTime) {
      errors.push({
        type: 'warning',
        field: 'main.totalRunTime',
        name: 'Total Run Time',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.stakeholders.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.stakeholders',
        name: 'Stakeholder(s)',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.color) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.color',
        name: 'Color / Black & White ',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.originCountries.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.originCountries',
        name: 'Countries of origin',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.salesInfo.certifications) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.certifications',
        name: 'Certifications',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesInfo.rating.length === 0) {
      errors.push({
        type: 'warning',
        field: 'salesInfo.rating',
        name: 'Rating',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.salesCast.cast.length === 0) {
      errors.push({
        type: 'warning',
        field: 'salesCast.cast',
        name: "Principal Cast",
        reason: 'Optional fields are missing',
        hint: 'Edit corresponding sheets fields: directors, principal cast.'
      });
    }

    if (!movie.main.shortSynopsis) {
      errors.push({
        type: 'warning',
        field: 'main.shortSynopsis',
        name: 'Synopsis',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.genres.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.genres',
        name: 'Genres',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.festivalPrizes.prizes.length === 0) {
      errors.push({
        type: 'warning',
        field: 'festivalPrizes.prizes',
        name: 'Festival Prizes',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.promotionalDescription.keyAssets.length === 0) {
      errors.push({
        type: 'warning',
        field: 'promotionalDescription.keyAssets',
        name: 'Key assets',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.promotionalDescription.keywords.length === 0) {
      errors.push({
        type: 'warning',
        field: 'promotionalDescription.keywords',
        name: 'Keywords',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.main.originalLanguages.length === 0) {
      errors.push({
        type: 'warning',
        field: 'main.originalLanguages',
        name: 'Languages',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.versionInfo.dubbings.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.dubbings',
        name: 'Dubbings',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.versionInfo.subtitles.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.subtitles',
        name: 'Subtitles',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    /*
    @todo #1562  Wait for  #1411
    if (movie.versionInfo.captions.length === 0) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.captions',
        name: 'Captions',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }*/

    if (movie.budget.totalBudget === undefined) {
      errors.push({
        type: 'warning',
        field: 'budget.totalBudget',
        name: 'Budget',
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


  public async formatDistributionDeals(sheetTab: SheetTab) {
    this.clearDataSources();
    sheetTab.rows.forEach(async spreadSheetRow => {

      if (spreadSheetRow[SpreadSheetDistributionDeal.internalRef]) {
        const movie = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetDistributionDeal.internalRef]);
        const distributionDeal = createDistributionDeal();

        let contract = initContractWithVersion();

        const importErrors = {
          distributionDeal,
          contract,
          errors: [],
          movieInternalRef: spreadSheetRow[SpreadSheetDistributionDeal.internalRef],
          movieTitle: movie ? movie.main.title.original : undefined,
          movieId: movie ? movie.id : undefined
        } as DealsImportState;

        if (movie) {

          /////////////////
          // CONTRACT STUFF
          /////////////////

          // Retreive the contract that will handle the deal
          if (spreadSheetRow[SpreadSheetDistributionDeal.distributionDealId]) {
            distributionDeal.id = spreadSheetRow[SpreadSheetDistributionDeal.distributionDealId];
          }

          contract = await this.contractService.getContractWithLastVersionFromDeal(movie.id, distributionDeal.id);
          if (contract) {
            importErrors.contract = contract;

            /////////////////
            // LICENSE STUFF
            /////////////////

            /* LICENSOR */

            // Nothing to do. Should be the same infos already filled in previously imported contract sheet

            /* LICENSEE */

            // Retreive the licensee inside the contract to update his infos
            const licensee = this.contractService.getContractParties(contract.doc, 'licensee').shift();
            if (licensee === undefined) {
              throw new Error(`No licensee found in contract : ${contract.doc.id ? contract.doc.id : 'unknown Id'}.`);
            }

            // SHOW NAME
            if (spreadSheetRow[SpreadSheetDistributionDeal.displayLicenseeName]) {
              licensee.party.showName = spreadSheetRow[SpreadSheetDistributionDeal.displayLicenseeName].toLowerCase() === 'yes' ? true : false;
            }

            /////////////////
            // TERMS STUFF
            /////////////////

            // BEGINNING OF RIGHTS
            if (spreadSheetRow[SpreadSheetDistributionDeal.rightsStart]) {
              const rightsStart: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.rightsStart]);
              const dateStart = new Date(`${rightsStart.y}-${rightsStart.m}-${rightsStart.d}`);
              if (isNaN(dateStart.getTime())) { // ie invalid date
                distributionDeal.terms.startLag = spreadSheetRow[SpreadSheetDistributionDeal.rightsStart];
              } else {
                distributionDeal.terms.start = dateStart
              }
            }

            // END OF RIGHTS
            if (spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd]) {
              const rightsEnd: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd]);
              const dateEnd = new Date(`${rightsEnd.y}-${rightsEnd.m}-${rightsEnd.d}`);
              if (isNaN(dateEnd.getTime())) { // ie invalid date
                distributionDeal.terms.endLag = spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd];
              } else {
                distributionDeal.terms.end = dateEnd
              }
            }

            // TERRITORIES (Mandate Territories)
            if (spreadSheetRow[SpreadSheetDistributionDeal.territories]) {
              distributionDeal.territory = [];
              spreadSheetRow[SpreadSheetDistributionDeal.territories].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
                const territory = getCodeIfExists('TERRITORIES', c);
                if (territory) {
                  distributionDeal.territory.push(territory);
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'territories',
                    name: 'Territories sold',
                    reason: `${c} not found in territories list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // TERRITORIES EXCLUDED
            if (spreadSheetRow[SpreadSheetDistributionDeal.territoriesExcluded]) {
              distributionDeal.territoryExcluded = [];
              spreadSheetRow[SpreadSheetDistributionDeal.territoriesExcluded].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
                const territory = getCodeIfExists('TERRITORIES', c);
                if (territory) {
                  distributionDeal.territoryExcluded.push(territory);
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'territories excluded',
                    name: 'Territories excluded',
                    reason: `${c} not found in territories list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // MEDIAS (Mandate Medias)
            if (spreadSheetRow[SpreadSheetDistributionDeal.licenseType]) {
              distributionDeal.licenseType = [];
              spreadSheetRow[SpreadSheetDistributionDeal.licenseType].split(this.separator).forEach((c: ExtractCode<'MEDIAS'>) => {
                const media = getCodeIfExists('MEDIAS', c);
                if (media) {
                  distributionDeal.licenseType.push(media);
                } else {
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'medias',
                    name: 'Media(s)',
                    reason: `${c} not found in medias list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // DUBS (Authorized language(s))
            if (spreadSheetRow[SpreadSheetDistributionDeal.dubbings]) {
              spreadSheetRow[SpreadSheetDistributionDeal.dubbings].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
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
                    name: 'Authorized language(s)',
                    reason: `${g} not found in languages list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });

            }

            // SUBTILES (Available subtitle(s))
            if (spreadSheetRow[SpreadSheetDistributionDeal.subtitles]) {
              spreadSheetRow[SpreadSheetDistributionDeal.subtitles].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
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
                    name: 'Authorized subtitle(s)',
                    reason: `${g} not found in languages list`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              });
            }

            // CAPTIONS (Available subtitle(s))
            if (spreadSheetRow[SpreadSheetDistributionDeal.captions]) {
              spreadSheetRow[SpreadSheetDistributionDeal.captions].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
                const caption = getCodeIfExists('LANGUAGES', g);
                if (!!caption) {
                  distributionDeal.assetLanguage = populateMovieLanguageSpecification(
                    distributionDeal.assetLanguage,
                    caption,
                    MovieLanguageTypes.caption
                  );
                } else {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'caption',
                    name: 'Authorized caption(s)',
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
            if (!isNaN(Number(spreadSheetRow[SpreadSheetDistributionDeal.priceAmount]))) {
              // We increment global price for this title with the current deal price.
              contract.last.titles[movie.id].price.amount += parseInt(spreadSheetRow[SpreadSheetDistributionDeal.priceAmount], 10);
            }

            // CURRENCY
            if (spreadSheetRow[SpreadSheetDistributionDeal.priceCurrency]) {
              contract.last.titles[movie.id].price.currency = spreadSheetRow[SpreadSheetDistributionDeal.priceCurrency];
            }

            // CATCH UP 
            if (spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate] || spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]) {
              distributionDeal.catchUp = createTerms();

              // CATCH UP START
              if (spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate]) {
                try {
                  const ssfCatchUpStartDate: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate]);
                  const catchUpStartDate = new Date(`${ssfCatchUpStartDate.y}-${ssfCatchUpStartDate.m}-${ssfCatchUpStartDate.d}`);
                  if (isNaN(catchUpStartDate.getTime())) {
                    distributionDeal.catchUp.startLag = spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate];
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'distributionDeal.catchUp.start',
                      name: 'CatchUp start',
                      reason: `Failed to parse CatchUp start date, moved data to startLag`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  } else {
                    distributionDeal.catchUp.start = catchUpStartDate;
                  }
                } catch (error) {
                  distributionDeal.catchUp.startLag = spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate];
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'distributionDeal.catchUp.start',
                    name: 'CatchUp start',
                    reason: `Failed to parse CatchUp start date, moved data to startLag`,
                    hint: 'Edit corresponding sheet field.'
                  });
                }
              }

              // CATCH UP END
              if (spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]) {
                const ssfCatchUpEndDate: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]);
                const catchUpEndDate = distributionDeal.catchUp.end = new Date(`${ssfCatchUpEndDate.y}-${ssfCatchUpEndDate.m}-${ssfCatchUpEndDate.d}`);
                if (isNaN(catchUpEndDate.getTime())) {
                  distributionDeal.catchUp.endLag = spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate];
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'distributionDeal.catchUp.end',
                    name: 'CatchUp end',
                    reason: `Failed to parse CatchUp end date, moved data to endLag`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  distributionDeal.catchUp.end = catchUpEndDate;
                }
              }
            }

            // MULTIDIFFUSION
            if (spreadSheetRow[SpreadSheetDistributionDeal.multidiffusion]) {
              const multiDiffDates = spreadSheetRow[SpreadSheetDistributionDeal.multidiffusion].split(this.separator)
              multiDiffDates.forEach(date => {
                const ssfDiffusionDate: SSF$Date = SSF.parse_date_code(date);
                const diffusion = createTerms();
                const diffusionDate = new Date(`${ssfDiffusionDate.y}-${ssfDiffusionDate.m}-${ssfDiffusionDate.d}`);

                if (isNaN(diffusionDate.getTime())) {
                  diffusion.startLag = date;
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'multidiffusion.start',
                    name: 'Multidiffusion start',
                    reason: `Failed to parse multidiffusion start date, moved data to startLag`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  diffusion.start = diffusionDate;
                }

                distributionDeal.multidiffusion.push(diffusion);
              });
            }

            // HOLDBACKS
            if (spreadSheetRow[SpreadSheetDistributionDeal.holdbacks]) {
              const holdbacks = spreadSheetRow[SpreadSheetDistributionDeal.holdbacks].split(this.separator)
              holdbacks.forEach(h => {
                const holdbackParts = h.split(this.subSeparator);
                const media = getCodeIfExists('MEDIAS', holdbackParts[0] as ExtractCode<'MEDIAS'>);

                if (holdbackParts.length !== 3) {
                  importErrors.errors.push({
                    type: 'error',
                    field: 'holdback',
                    name: 'Holdback',
                    reason: `Failed to parse holdback entry`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  const holdBack = createHoldback();
                  if (media) {
                    holdBack.media = media;
                  } else {
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.media',
                      name: 'Holdback',
                      reason: `${holdbackParts[0]} not found in medias list`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  }

                  const ssfHoldBackStart: SSF$Date = SSF.parse_date_code(holdbackParts[1].trim());
                  const holdBackStart = new Date(`${ssfHoldBackStart.y}-${ssfHoldBackStart.m}-${ssfHoldBackStart.d}`);

                  if (isNaN(holdBackStart.getTime())) {
                    holdBack.terms.startLag = holdbackParts[1].trim();
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.start',
                      name: 'Holdback start',
                      reason: `Failed to parse holdback start date, moved data to startLag`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  } else {
                    holdBack.terms.start = holdBackStart;
                  }

                  const ssfHoldBackEnd: SSF$Date = SSF.parse_date_code(holdbackParts[2].trim());
                  const holdBackEnd = new Date(`${ssfHoldBackEnd.y}-${ssfHoldBackEnd.m}-${ssfHoldBackEnd.d}`);

                  if (isNaN(holdBackEnd.getTime())) {
                    holdBack.terms.endLag = holdbackParts[2].trim();
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.end',
                      name: 'Holdback end',
                      reason: `Failed to parse holdback end date, moved data to endLag`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  } else {
                    holdBack.terms.end = holdBackEnd;
                  }

                  distributionDeal.holdbacks.push(holdBack)
                }

              });
            }

            // Checks if sale already exists
            const existingDeal = await this.distributionDealService.getValue(distributionDeal.id)
            if (existingDeal) {
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
              field: 'contract',
              name: 'Contract',
              reason: `No contract found matching movieId: ${movie.id} and dealId: ${distributionDeal.id}`,
              hint: 'Try importing it first or check if data is correct.'
            });
          }
        } else {
          importErrors.errors.push({
            type: 'error',
            field: 'internalRef',
            name: 'Movie',
            reason: `Movie ${spreadSheetRow[SpreadSheetDistributionDeal.internalRef]} not found`,
            hint: 'Try importing it first or check if data is correct.'
          });
        }

        const saleWithErrors = await this.validateMovieSale(importErrors);
        this.deals.data.push(saleWithErrors);
        this.deals.data = [... this.deals.data];

        this.cdRef.detectChanges();
      }

    });
  }

  private async validateMovieSale(importErrors: DealsImportState): Promise<DealsImportState> {
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
    const isContractValid = await this.contractService.isContractValid(contract.doc);
    if (!isContractValid) {
      errors.push({
        type: 'error',
        field: 'contractId',
        name: 'Contract ',
        reason: 'Related contract not found',
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
        name: 'Territories sold',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // TERRITORIES EXCLUDED
    if (!distributionDeal.territoryExcluded) {
      errors.push({
        type: 'warning',
        field: 'territoryExcluded',
        name: 'Territories excluded',
        reason: 'Optionnal field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // LICENSE TYPE
    if (!distributionDeal.licenseType) {
      errors.push({
        type: 'error',
        field: 'medias',
        name: 'Media(s)',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // DUBBINGS
    if (!Object.keys(distributionDeal.assetLanguage).length) {
      errors.push({
        type: 'error',
        field: 'dubbings',
        name: 'Authorized language(s)',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    // EXCLUSIVE
    if (distributionDeal.exclusive === undefined) {
      errors.push({
        type: 'error',
        field: 'exclusive',
        name: 'Exclusive deal',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    //////////////////
    // OPTIONAL FIELDS
    //////////////////

    // TITLE PRICE VALIDATION
    Object.keys(contract.last.titles).forEach(titleId => {
      if (!contract.last.titles[titleId].price.amount) {
        errors.push({
          type: 'warning',
          field: 'price',
          name: 'Distribution deal price',
          reason: `Optional field is missing for ${titleId}`,
          hint: 'Edit corresponding sheet field.'
        });
      }
    })

    return importErrors;
  }

  public async formatContracts(sheetTab: SheetTab) {
    this.clearDataSources();

    const titlesFieldsCount = Object.keys(SpreadSheetContractTitle).length / 2; // To get enum length

    // For contract validation, we need to process contracts that have no parents first
    const sheetTabRowsWithNoParents: any[] = [];
    const sheetTabRowsWithParents: any[] = [];

    sheetTab.rows.forEach(spreadSheetRow => {
      if (!spreadSheetRow[SpreadSheetContract.parentContractIds]) {
        sheetTabRowsWithNoParents.push(spreadSheetRow);
      } else {
        sheetTabRowsWithParents.push(spreadSheetRow)
      }
    });

    const orderedSheetTabRows: any[] = sheetTabRowsWithNoParents.concat(sheetTabRowsWithParents);
    const matSnackbarRef = this.snackBar.open('Loading... Please wait', 'close');
    for (const spreadSheetRow of orderedSheetTabRows) {
      // CONTRACT ID
      // Create/retreive the contract
      let contract = initContractWithVersion();
      let newContract = true;
      if (spreadSheetRow[SpreadSheetContract.contractId]) {
        const existingContract = await this.contractService.getContractWithLastVersion(spreadSheetRow[SpreadSheetContract.contractId]);
        if (!!existingContract) {
          contract = existingContract;
          newContract = false;
        }
      }

      contract.doc.parentContractIds = [];
      contract.doc.childContractIds = [];

      if (spreadSheetRow[SpreadSheetContract.contractId]) {
        const importErrors = {
          contract,
          newContract: newContract,
          errors: [],
        } as ContractsImportState;

        if (newContract) {

          // LICENSORS
          /**
           * @dev We process this data only if this is for a new contract
           * Changing parties or titles for a same contract is forbidden
           * Only change into distribution deals is allowed and will lead to a new contractVersion
          */
          if (spreadSheetRow[SpreadSheetContract.licensors]) {
            spreadSheetRow[SpreadSheetContract.licensors].split(this.separator).forEach((licensorName: string) => {
              const licensorParts = licensorName.split(this.subSeparator);
              const licensor = createContractPartyDetail();
              licensor.party.displayName = licensorParts[0].trim();
              if (licensorParts[1]) {
                licensor.party.orgId = licensorParts[1].trim();
              }
              licensor.party.role = getCodeIfExists('LEGAL_ROLES', 'licensor');
              contract.doc.parties.push(licensor);
              if (licensor.party.orgId) {
                contract.doc.partyIds.push(licensor.party.orgId);
              }
            });
          }

          // LICENSEE
          if (spreadSheetRow[SpreadSheetContract.licensee]) {
            const licenseeParts = spreadSheetRow[SpreadSheetContract.licensee].split(this.subSeparator);
            const licensee = createContractPartyDetail();
            licensee.party.displayName = licenseeParts[0].trim();
            if (licenseeParts[1]) {
              licensee.party.orgId = licenseeParts[1].trim();
            }
            licensee.party.role = getCodeIfExists('LEGAL_ROLES', 'licensee');
            contract.doc.parties.push(licensee);
            if (licensee.party.orgId) {
              contract.doc.partyIds.push(licensee.party.orgId);
            }
          }

          // CHILD ROLES
          if (spreadSheetRow[SpreadSheetContract.childRoles]) {
            spreadSheetRow[SpreadSheetContract.childRoles].split(this.separator).forEach((r: string) => {
              const childRoleParts = r.split(this.subSeparator);
              const partyName = childRoleParts.shift().trim();
              const party = contract.doc.parties.find(p => p.party.displayName === partyName && p.party.role === getCodeIfExists('LEGAL_ROLES', 'licensor'));
              if (party) {
                childRoleParts.forEach(childRole => {
                  const role = getCodeIfExists('LEGAL_ROLES', childRole.trim() as ExtractCode<'LEGAL_ROLES'>);
                  if (role) {
                    party.childRoles.push(role);
                  } else {
                    importErrors.errors.push({
                      type: 'error',
                      field: 'contract.parties.childRoles',
                      name: 'Child roles',
                      reason: `Child role mismatch : ${childRole.trim()}`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  }
                });
              } else {
                importErrors.errors.push({
                  type: 'error',
                  field: 'contract.parties.childRoles',
                  name: 'Child roles',
                  reason: `Licensor name mismatch : ${partyName}`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            });
          }

          // PARENTS CONTRACTS
          if (spreadSheetRow[SpreadSheetContract.parentContractIds]) {
            spreadSheetRow[SpreadSheetContract.parentContractIds].split(this.separator).forEach((c: string) => {
              contract.doc.parentContractIds.push(c.trim());
            });
          }

          // CHILDS CONTRACTS
          if (spreadSheetRow[SpreadSheetContract.childContractIds]) {
            spreadSheetRow[SpreadSheetContract.childContractIds].split(this.separator).forEach((c: string) => {
              contract.doc.childContractIds.push(c.trim());
            });
          }
        }

        // CONTRACT STATUS
        if (spreadSheetRow[SpreadSheetContract.status]) {
          if (spreadSheetRow[SpreadSheetContract.status] in ContractStatus) {
            contract.last.status = spreadSheetRow[SpreadSheetContract.status];
          }
        }

        // CONTRACT CREATION DATE
        if (spreadSheetRow[SpreadSheetContract.creationDate]) {
          const creationDate: SSF$Date = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.creationDate]);
          contract.last.creationDate = new Date(`${creationDate.y}-${creationDate.m}-${creationDate.d}`);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'contract.last.creationDate',
            name: 'Creation date',
            reason: 'Contract creation date not found. Using current date',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // SCOPE DATE START
        if (spreadSheetRow[SpreadSheetContract.scopeStartDate]) {
          const scopeStartDate: SSF$Date = SSF.parse_date_code(SpreadSheetContract.scopeStartDate);
          contract.last.scope.start = new Date(`${scopeStartDate.y}-${scopeStartDate.m}-${scopeStartDate.d}`);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'contract.last.scope.start',
            name: 'Scope Start date',
            reason: 'Scope Start date not found',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // SCOPE DATE END
        if (spreadSheetRow[SpreadSheetContract.scopeEndDate]) {
          const scopeEndDate: SSF$Date = SSF.parse_date_code(SpreadSheetContract.scopeEndDate);
          contract.last.scope.end = new Date(`${scopeEndDate.y}-${scopeEndDate.m}-${scopeEndDate.d}`);
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'contract.last.scope.end',
            name: 'Scope End date',
            reason: 'Scope End date not found',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // PAYMENT SCHEDULES
        if (spreadSheetRow[SpreadSheetContract.paymentSchedules]) {
          spreadSheetRow[SpreadSheetContract.paymentSchedules].split(this.separator).forEach((r: string) => {
            const scheduleParts = r.split(this.subSeparator);
            if (scheduleParts.length >= 2) {
              const percentage = scheduleParts[1].indexOf('%') !== -1 ?
                parseInt(scheduleParts[1].trim().replace('%', ''), 10) :
                parseInt(scheduleParts[1].trim(), 10);
              const paymentSchedule = createPaymentSchedule({ label: scheduleParts[0].trim(), percentage });
              if (scheduleParts[2]) {
                paymentSchedule.date = scheduleParts[2].trim();
              }
              contract.last.paymentSchedule.push(paymentSchedule);
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'contract.last.paymentSchedule',
                name: 'Payment Schedule',
                reason: 'Error while parsing data',
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'contract.last.paymentSchedule',
            name: 'Payment Schedule',
            reason: 'Missing data',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // TITLES STUFF
        let titleIndex = 0;
        // @dev this while is why we need to do a for(const of ...) (pretty sure)
        while (spreadSheetRow[SpreadSheetContract.titleStuffIndexStart + titleIndex]) {
          const currentIndex = SpreadSheetContract.titleStuffIndexStart + titleIndex;
          titleIndex += titlesFieldsCount;
          const titleDetails = await this.processTitleDetails(spreadSheetRow, currentIndex);

          if (importErrors.newContract && contract.last.titles[titleDetails.titleId] !== undefined) {
            importErrors.errors.push({
              type: 'error',
              field: 'titleIds',
              name: 'Film Code',
              reason: `Duplicate film code found : ${titleDetails.titleId}`,
              hint: 'Edit corresponding sheet field.'
            });
          } else {
            contract.last.titles[titleDetails.titleId] = titleDetails;
            if (contract.doc.titleIds.indexOf(titleDetails.titleId) === -1) {
              contract.doc.titleIds.push(titleDetails.titleId);
            }
          }
        }


        ///////////////
        // VALIDATION
        ///////////////

        const contractWithErrors = await this.validateMovieContract(importErrors);

        // Since contracts are not saved to DB yet, we need to manually pass them to isContractValid function
        const parentContracts: Contract[] = [];
        const otherContractsUploaded: Contract[] = this.contractsToUpdate.data.map(importState => importState.contract.doc)
          .concat(this.contractsToCreate.data.map(importState => importState.contract.doc));
        contract.doc.parentContractIds.forEach(parentId => {
          const parentContract = otherContractsUploaded.find(o => o.id === parentId);
          if (parentContract) {
            parentContracts.push(parentContract);
          }
        });

        contractWithErrors.contract.doc = await this.contractService.populatePartiesWithParentRoles(contractWithErrors.contract.doc, parentContracts);

        if (!contractWithErrors.newContract) {
          this.contractsToUpdate.data.push(contractWithErrors);
          this.contractsToUpdate.data = [... this.contractsToUpdate.data];
        } else {
          contractWithErrors.contract.doc.id = spreadSheetRow[SpreadSheetContract.contractId];
          this.contractsToCreate.data.push(contractWithErrors);
          this.contractsToCreate.data = [... this.contractsToCreate.data];
        }

        this.cdRef.detectChanges();
      }
    };
    matSnackbarRef.dismissWithAction(); // loading ended
  }

  private async validateMovieContract(importErrors: ContractsImportState): Promise<ContractsImportState> {

    const contract = importErrors.contract;
    const errors = importErrors.errors;

    //////////////////
    // REQUIRED FIELDS
    //////////////////

    //  CONTRACT VALIDATION
    const isContractValid = await this.contractService.isContractValid(contract.doc);
    if (!isContractValid) {
      errors.push({
        type: 'error',
        field: 'contractId',
        name: 'Contract',
        reason: 'Contract is not valid',
        hint: 'Edit corresponding sheet field.'
      });
    }


    //////////////////
    // OPTIONAL FIELDS
    //////////////////

    // CONTRACT PRICE VALIDATION
    /*if (!contract.price.amount) {
      errors.push({
        type: 'warning',
        field: 'price',
        name: 'Distribution deal price',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }*/

    // CONTRACT STATUS
    if (!contract.last.status) {
      errors.push({
        type: 'warning',
        field: 'contract.last.status',
        name: 'Contract Status',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    return importErrors;
  }

  private async processTitleDetails(spreadSheetRow: any[], currentIndex: number): Promise<ContractTitleDetail> {
    const titleDetails = createContractTitleDetail();
    titleDetails.price.fees = [];

    if (spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]) {
      const title = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]);
      if (title === undefined) {
        throw new Error(`Movie ${spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]} is missing id database.`);
      }
      titleDetails.titleId = title.id;
    }

    if (spreadSheetRow[SpreadSheetContractTitle.licensedRightIds + currentIndex]) {
      titleDetails.distributionDealIds = spreadSheetRow[SpreadSheetContractTitle.licensedRightIds + currentIndex]
        .split(this.separator)
        .map(c => c.trim());
    }

    if (spreadSheetRow[SpreadSheetContractTitle.commission + currentIndex]) {
      titleDetails.price.commission = spreadSheetRow[SpreadSheetContractTitle.commission + currentIndex]
    }

    const fee = createFee();
    if (spreadSheetRow[SpreadSheetContractTitle.feeLabel + currentIndex]) {
      fee.label = spreadSheetRow[SpreadSheetContractTitle.feeLabel + currentIndex];
    }

    if (spreadSheetRow[SpreadSheetContractTitle.feeValue + currentIndex]) {
      fee.price.amount = spreadSheetRow[SpreadSheetContractTitle.feeValue + currentIndex];
    }

    if (spreadSheetRow[SpreadSheetContractTitle.feeCurrency + currentIndex]) {
      if (spreadSheetRow[SpreadSheetContractTitle.feeCurrency + currentIndex].toLowerCase() === 'eur') {
        fee.price.currency = 'euro';
      }
    }

    titleDetails.price.fees.push(fee);

    return titleDetails;
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
    this.deals.data = [];
  }
}
