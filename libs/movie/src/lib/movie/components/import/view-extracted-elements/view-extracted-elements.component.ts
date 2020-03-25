import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import {
  Movie,
  createMovieMain,
  createMoviePromotionalDescription,
  createMovieSalesCast,
  createMovieSalesInfo,
  createMovieFestivalPrizes,
  createMovieSalesAgentDeal,
  createPromotionalElement,
  createMovieBudget,
  createMoviePromotionalElements,
  createPrize,
  populateMovieLanguageSpecification,
  MovieService,
  createMovieRating,
  createMovieOriginalRelease,
  createMovieStory,
  createDocumentMeta,
  createBoxOffice,
  createMovieReview
} from '../../../+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatCredits } from '@blockframes/utils/spreadsheet/format';
import { ImageUploader, cleanModel, getKeyIfExists } from '@blockframes/utils';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { SSF } from 'xlsx';
import {
  PremiereType,
  storeType,
  workType,
  storeStatus,
  unitBox,
  movieLanguageTypes,
  MovieLanguageTypesValue,
  UnitBoxValue,
  premiereType
} from '@blockframes/movie/+state/movie.firestore';
import { createStakeholder } from '@blockframes/utils/common-interfaces/identity';
import { DistributionDeal, createDistributionDeal, createHoldback } from '@blockframes/distribution-deals/+state/distribution-deal.model';
import {
  createContractPartyDetail,
  createContractTitleDetail,
  Contract,
  initContractWithVersion,
  ContractWithLastVersion
} from '@blockframes/contract/contract/+state/contract.model';
import { ContractTitleDetail, contractType, contractStatus } from '@blockframes/contract/contract/+state/contract.firestore';
import { DistributionDealService } from '@blockframes/distribution-deals/+state/distribution-deal.service';
import { createExpense, createPrice } from '@blockframes/utils/common-interfaces/price';
import { ContractService } from '@blockframes/contract/contract/+state/contract.service';
import { createPaymentSchedule } from '@blockframes/utils/common-interfaces/schedule';
import { createTerms, createRange } from '@blockframes/utils/common-interfaces';
import { Intercom } from 'ng-intercom';
import { AuthService } from '@blockframes/auth';

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
}

export interface ContractsImportState {
  errors?: SpreadsheetImportError[];
  newContract: boolean;
  contract: ContractWithLastVersion;
}

enum SpreadSheetMovie {
  internationalTitle,
  originalTitle,
  internalRef,
  workType,
  productionStatus,
  directors,
  originCountries,
  stakeholdersWithRole,
  originCountryReleaseDate,
  languages,
  genres,
  length,
  cast,
  festivalPrizes,
  synopsis,
  keyAssets,
  keywords,
  productionYear,
  producers,
  crewMembers,
  budget,
  worldwideBoxOffice,
  nationalBoxOffice,
  quotas,
  rating,
  filmReviews,
  color,
  shootingFormat,
  availableFormat,
  soundQuality,
  availableVersions,
  poster,
  bannerLink,
  stillLinks,
  presentationDeck,
  scenarioLink,
  screenerLink,
  promoReelLink,
  trailerLink,
  pitchTeaserLink,

  //////////////////
  // ADMIN FIELDS
  //////////////////

  scoring,
  storeType,
  movieStatus,
  userId,
}

enum SpreadSheetDistributionDeal {
  internalRef,
  distributionDealId,
  internationalTitle, // unused
  licensorName, // unused
  licenseeName, // unused
  rightsStart,
  rightsEnd,
  territories,
  territoriesExcluded,
  licenseType,
  dubbings,
  subtitles,
  captions,
  exclusive,
  catchUpStartDate,
  catchUpEndDate,
  multidiffusion,
  holdbacks
}

enum SpreadSheetContract {
  licensors,
  licensee,
  displayLicenseeName,
  childRoles,
  contractId,
  contractType,
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
  licensedRightIds, // ie: distributionDealIds
  titlePrice,
  commission,
  expenseLabel,
  expenseValue,
  expenseCurrency,
}

@Component({
  selector: 'movie-view-extracted-elements',
  templateUrl: './view-extracted-elements.component.html',
  styleUrls: ['./view-extracted-elements.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedElementsComponent implements OnInit {

  public moviesToCreate = new MatTableDataSource<MovieImportState>();
  public moviesToUpdate = new MatTableDataSource<MovieImportState>();
  public deals = new MatTableDataSource<DealsImportState>();
  public contractsToUpdate = new MatTableDataSource<ContractsImportState>();
  public contractsToCreate = new MatTableDataSource<ContractsImportState>();
  private separator = ';';
  private subSeparator = ',';
  private deepDatesRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](\d{4})$/;
  public isUserBlockframesAdmin = false;

  constructor(
    private snackBar: MatSnackBar,
    private movieService: MovieService,
    private distributionDealService: DistributionDealService,
    private contractService: ContractService,
    private imageUploader: ImageUploader,
    private cdRef: ChangeDetectorRef,
    private intercom: Intercom,
    private authService: AuthService,
  ) { }

  async ngOnInit() {
    this.isUserBlockframesAdmin = await this.authService.isBlockframesAdmin();
    this.cdRef.markForCheck();
  }

  public formatMovies(sheetTab: SheetTab) {
    this.clearDataSources();

    sheetTab.rows.forEach(async spreadSheetRow => {
      if (spreadSheetRow[SpreadSheetMovie.originalTitle] && spreadSheetRow[SpreadSheetMovie.internalRef]) {
        const existingMovie = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetMovie.internalRef]);
        const movie = {
          main: createMovieMain(),
          promotionalDescription: createMoviePromotionalDescription(),
          promotionalElements: createMoviePromotionalElements({}, false),
          salesCast: createMovieSalesCast(),
          salesInfo: createMovieSalesInfo(),
          versionInfo: { languages: {} }, // TODO issue #1596
          festivalPrizes: createMovieFestivalPrizes(),
          salesAgentDeal: createMovieSalesAgentDeal(),
          budget: createMovieBudget(),
          story: createMovieStory(),
          ...existingMovie ? cleanModel(existingMovie) : undefined
        } as Movie;

        const importErrors = { movie, errors: [] } as MovieImportState;

        //////////////////
        // REQUIRED FIELDS
        //////////////////

        // INTERNAL REF (Film Code)
        movie.main.internalRef = spreadSheetRow[SpreadSheetMovie.internalRef];

        // WORK TYPE
        if (spreadSheetRow[SpreadSheetMovie.workType]) {
          const key = getKeyIfExists(workType, spreadSheetRow[SpreadSheetMovie.workType]);
          if (key) {
            movie.main.workType = key;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.main.workType',
              name: 'Work Type',
              reason: `Could not parse work type : ${spreadSheetRow[SpreadSheetMovie.workType].trim().toLowerCase()}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        }

        // ORIGINAL TITLE (Original Title)
        if (spreadSheetRow[SpreadSheetMovie.originalTitle]) {
          movie.main.title.original = spreadSheetRow[SpreadSheetMovie.originalTitle];
        }

        // PRODUCTION YEAR
        if (!isNaN(Number(spreadSheetRow[SpreadSheetMovie.productionYear]))) {
          movie.main.productionYear = parseInt(spreadSheetRow[SpreadSheetMovie.productionYear], 10);
        }

        // DIRECTORS (Director(s))
        if (spreadSheetRow[SpreadSheetMovie.directors]) {
          movie.main.directors = formatCredits(spreadSheetRow[SpreadSheetMovie.directors], this.separator, this.subSeparator);
        }

        // POSTER (Poster)
        const poster = await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.poster]);
        const moviePoster = createPromotionalElement({
          label: 'Poster',
          media: poster,
        });
        movie.promotionalElements.poster.push(moviePoster);

        //////////////////
        // OPTIONAL FIELDS
        //////////////////

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
          spreadSheetRow[SpreadSheetMovie.stakeholdersWithRole].split(this.separator).forEach((p: string) => {
            const stakeHolderParts = p.split(this.subSeparator);
            const stakeHolder = createStakeholder({ displayName: stakeHolderParts[0].trim() });
            const role = getCodeIfExists('STAKEHOLDER_ROLES', stakeHolderParts[1] as ExtractCode<'STAKEHOLDER_ROLES'>);
            if (stakeHolderParts[2]) {
              const country = getCodeIfExists('TERRITORIES', stakeHolderParts[2] as ExtractCode<'TERRITORIES'>);
              if (country) {
                stakeHolder.countries.push(country);
              } else {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'movie.main.stakeholders',
                  name: 'Stakeholders',
                  reason: `${stakeHolderParts[2]} not found in territories list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            }
            if (role) {
              switch (role) {
                case 'broadcaster-coproducer':
                  movie.main.stakeholders.broadcasterCoproducer.push(stakeHolder);
                  break;
                case 'financier':
                  movie.main.stakeholders.financier.push(stakeHolder);
                  break;
                case 'laboratory':
                  movie.main.stakeholders.laboratory.push(stakeHolder);
                  break;
                case 'sales-agent':
                  movie.main.stakeholders.salesAgent.push(stakeHolder);
                  break;
                case 'distributor':
                  movie.main.stakeholders.distributor.push(stakeHolder);
                  break;
                case 'line-producer':
                  movie.main.stakeholders.lineProducer.push(stakeHolder);
                  break;
                case 'co-producer':
                  movie.main.stakeholders.coProducer.push(stakeHolder);
                  break;
                case 'executive-producer':
                default:
                  movie.main.stakeholders.executiveProducer.push(stakeHolder);
                  break;
              }
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.main.stakeholders',
                name: 'Stakeholders',
                reason: `${stakeHolderParts[1]} not found in Stakeholders roles list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
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

        // PEGI (Rating)
        if (spreadSheetRow[SpreadSheetMovie.rating]) {
          spreadSheetRow[SpreadSheetMovie.rating].split(this.separator).forEach((r: string) => {
            const ratingParts = r.split(this.subSeparator);
            const country = getCodeIfExists('TERRITORIES', ratingParts[0] as ExtractCode<'TERRITORIES'>);
            const movieRating = createMovieRating({ value: ratingParts[1].trim() });

            if (ratingParts[2]) { // System
              const system = getCodeIfExists('RATING', ratingParts[2] as ExtractCode<'RATING'>);

              if (system) {
                movieRating.system = system;
              } else {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'rating',
                  name: 'Movie rating',
                  reason: `Could not parse rating : ${ratingParts[2].trim().toLowerCase()}`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            }

            if (ratingParts[3]) { // Reason
              movieRating.reason = ratingParts[3].trim();
            }

            if (country) {
              movieRating.country = country;
            }

            movie.salesInfo.rating.push(movieRating);
          });
        }

        // FILM REVIEW
        if (spreadSheetRow[SpreadSheetMovie.filmReviews]) {
          movie.movieReview = [];
          spreadSheetRow[SpreadSheetMovie.filmReviews].split(this.separator).forEach(review => {
            const filmReviewParts = review.split(this.subSeparator);
            if (filmReviewParts.length >= 3) {
              const movieReview = createMovieReview({
                journalName: filmReviewParts[0].trim(),
                revueLink: filmReviewParts[1].trim(),
                criticQuote: filmReviewParts[2].trim()
              })

              movie.movieReview.push(movieReview);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'movie.movieReview',
                name: 'Movie review',
                reason: `Could not parse review : ${review}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          })
        };

        // SHOOTING FORMAT
        if (spreadSheetRow[SpreadSheetMovie.shootingFormat]) {
          const shootingFormat = getCodeIfExists('MOVIE_FORMAT', spreadSheetRow[SpreadSheetMovie.shootingFormat].toString().trim());
          if (shootingFormat) {
            movie.salesInfo.format = shootingFormat;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.salesInfo.format',
              name: 'Shooting format',
              reason: `Could not parse ${spreadSheetRow[SpreadSheetMovie.shootingFormat]}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        };

        // AVAILABLE FORMAT (formatQuality)
        if (spreadSheetRow[SpreadSheetMovie.availableFormat]) {
          const availableFormat = getCodeIfExists('MOVIE_FORMAT_QUALITY', spreadSheetRow[SpreadSheetMovie.availableFormat].trim());
          if (availableFormat) {
            movie.salesInfo.formatQuality = availableFormat;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.salesInfo.formatQuality',
              name: 'formatQuality',
              reason: `Could not parse ${spreadSheetRow[SpreadSheetMovie.availableFormat]}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        };

        // AVAILABLE FORMAT (soundQuality)
        if (spreadSheetRow[SpreadSheetMovie.soundQuality]) {
          const soundQuality = getCodeIfExists('SOUND_FORMAT', spreadSheetRow[SpreadSheetMovie.soundQuality].trim());
          if (soundQuality) {
            movie.salesInfo.soundFormat = soundQuality;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.salesInfo.soundQuality',
              name: 'soundQuality',
              reason: `Could not parse ${spreadSheetRow[SpreadSheetMovie.soundQuality]}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        };

        // CERTIFICATIONS (Certifications)
        if (spreadSheetRow[SpreadSheetMovie.quotas]) {
          spreadSheetRow[SpreadSheetMovie.quotas].split(this.separator).forEach((c: ExtractCode<'CERTIFICATIONS'>) => {
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
          movie.salesCast.cast = formatCredits(spreadSheetRow[SpreadSheetMovie.cast], this.separator, '\\s+', 'CAST_ROLES');
        }

        // CREDITS (Producers)
        if (spreadSheetRow[SpreadSheetMovie.producers]) {
          movie.salesCast.producers = formatCredits(spreadSheetRow[SpreadSheetMovie.producers], this.separator, this.subSeparator, 'PRODUCER_ROLES');
        }

        // CREDITS (Crew members)
        if (spreadSheetRow[SpreadSheetMovie.crewMembers]) {
          movie.salesCast.crew = formatCredits(spreadSheetRow[SpreadSheetMovie.crewMembers], this.separator, this.subSeparator, 'CREW_ROLES');
        }

        // SYNOPSIS (Synopsis)
        if (spreadSheetRow[SpreadSheetMovie.synopsis]) {
          movie.story.synopsis = spreadSheetRow[SpreadSheetMovie.synopsis];
        }

        // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
        if (spreadSheetRow[SpreadSheetMovie.originCountryReleaseDate]) {

          spreadSheetRow[SpreadSheetMovie.originCountryReleaseDate].split(this.separator).forEach((o: ExtractCode<'TERRITORIES'>) => {
            const originalReleaseParts = o.split(this.subSeparator);
            const dateParts = originalReleaseParts[2].trim().match(this.deepDatesRegex)
            let date: Date;
            if (dateParts && dateParts.length === 4) {
              date = new Date(`${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`);
            }
            const originalRelease = createMovieOriginalRelease({ date });
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
                    prize.premiere = 'international';
                    break;
                  default:
                    prize.premiere = getKeyIfExists(premiereType, prizeParts[3] as PremiereType);
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
          movie.main.originalLanguages = [];
          spreadSheetRow[SpreadSheetMovie.languages].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
            const language = getCodeIfExists('LANGUAGES', g);
            if (language) {
              movie.main.originalLanguages.push(language);
              populateMovieLanguageSpecification(movie.versionInfo.languages, language, 'original', true);
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

        // VERSIONS (Available versions(s))
        if (spreadSheetRow[SpreadSheetMovie.availableVersions]) {
          spreadSheetRow[SpreadSheetMovie.availableVersions].split(this.separator).forEach((version: string) => {

            const versionParts = version.split(this.subSeparator);
            const languageTemp = versionParts.shift();
            const language = getCodeIfExists('LANGUAGES', languageTemp as ExtractCode<'LANGUAGES'>);

            const parseErrors = [];
            if (language) {
              versionParts.map(v => v.trim()).forEach((v : MovieLanguageTypesValue) => {
                const key = getKeyIfExists(movieLanguageTypes, v);
                if (key) {
                  populateMovieLanguageSpecification(movie.versionInfo.languages, language, key, true);
                } else {
                  parseErrors.push(v.toLowerCase());
                }
              });

              if (parseErrors.length) {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'movie.versionInfo.languages',
                  name: 'Available version(s)',
                  reason: `Could not parse: ${parseErrors.join(', ')}`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'movie.versionInfo.languages',
                name: 'Available version(s)',
                reason: `${languageTemp} not found in languages list`,
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
          if (spreadSheetRow[SpreadSheetMovie.budget].indexOf('-') !== -1) {
            const budgetParts = spreadSheetRow[SpreadSheetMovie.budget].split('-');
            const currency = budgetParts[0].slice(0, 1);
            const from = parseInt(budgetParts[0].slice(1).trim(), 10);
            const to = parseInt(budgetParts[1].replace('millions', '').trim(), 10);

            switch (currency) {
              case '$':
                movie.budget.budgetCurrency = 'USD';
                break;
              case '€':
              default:
                movie.budget.budgetCurrency = 'EUR';
                break;
            }

            movie.budget.estimatedBudget = createRange({ from: from * 1000000, to: to * 1000000, label: spreadSheetRow[SpreadSheetMovie.budget] });
          } else {
            movie.budget.totalBudget = spreadSheetRow[SpreadSheetMovie.budget];
          }
        }

        movie.budget.boxOffice = [];
        // WORLDWIDE BOX OFFICE
        if (spreadSheetRow[SpreadSheetMovie.worldwideBoxOffice]) {
          spreadSheetRow[SpreadSheetMovie.worldwideBoxOffice].split(this.separator).forEach((version: string) => {
            const boxOfficeParts = version.split(this.subSeparator);
            const unit = getKeyIfExists(unitBox, boxOfficeParts[0] as UnitBoxValue);
            if (unit) {
              movie.budget.boxOffice.push(createBoxOffice(
                {
                  unit,
                  value: boxOfficeParts[1] ? parseInt(boxOfficeParts[1], 10) : 0,
                  territory: getCodeIfExists('TERRITORIES', 'world')
                }
              ));
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'movie.budget.boxOffice',
                name: 'WorldWide Box office',
                reason: `Could not parse worldwide box office UnitBox : ${boxOfficeParts[0].trim()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // NATIONAL BOX OFFICE
        if (spreadSheetRow[SpreadSheetMovie.nationalBoxOffice]) {
          spreadSheetRow[SpreadSheetMovie.nationalBoxOffice].split(this.separator).forEach((version: string) => {
            const boxOfficeParts = version.split(this.subSeparator);

            const territory = getCodeIfExists('TERRITORIES', boxOfficeParts[0].trim());
            if (territory) {
              const unit = getKeyIfExists(unitBox, boxOfficeParts[1] as UnitBoxValue);
              if (unit) {
                movie.budget.boxOffice.push(createBoxOffice(
                  {
                    unit,
                    value: boxOfficeParts[2] ? parseInt(boxOfficeParts[2], 10) : 0,
                    territory: territory
                  }
                ));
              } else {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'movie.budget.boxOffice',
                  name: 'Box office',
                  reason: `Could not parse national box office UnitBox : ${boxOfficeParts[1].trim()}`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.budget.boxOffice',
                name: 'National Box office',
                reason: `Could not parse box office territory : ${boxOfficeParts[0].trim()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
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

        // IMAGE STILLS LINK
        if (spreadSheetRow[SpreadSheetMovie.stillLinks]) {
          movie.promotionalElements.still_photo = [];
          for (const still of spreadSheetRow[SpreadSheetMovie.stillLinks].split(this.separator)) {
            const media = await this.imageUploader.upload(still);
            const element = createPromotionalElement({ label: 'Still', media });
            movie.promotionalElements.still_photo.push(element);
          }
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Stills',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // PRESENTATION DECK
        if (spreadSheetRow[SpreadSheetMovie.presentationDeck]) {
          const promotionalElement = createPromotionalElement({
            label: 'Presentation deck',
            media: spreadSheetRow[SpreadSheetMovie.presentationDeck],
          });
          movie.promotionalElements.presentation_deck = promotionalElement;
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Presentation deck',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        //////////////////
        // ADMIN FIELDS
        //////////////////

        if (this.isUserBlockframesAdmin) {
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

          // STORE TYPE
          if (spreadSheetRow[SpreadSheetMovie.storeType]) {
            const key = getKeyIfExists(storeType, spreadSheetRow[SpreadSheetMovie.storeType]);
            if (key) {
              movie.main.storeConfig.storeType = key;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.main.storeConfig.storeType',
                name: 'Movie store type',
                reason: `Could not parse store type : ${spreadSheetRow[SpreadSheetMovie.storeType].trim().toLowerCase()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          } else {
            movie.main.storeConfig.storeType = 'line_up';
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.main.storeConfig.storeType',
              name: 'Movie store type',
              reason: `Store type not found, assumed "${storeType.line_up}"`,
              hint: 'Edit corresponding sheet field.'
            });
          }

          // MOVIE STATUS
          if (spreadSheetRow[SpreadSheetMovie.movieStatus]) {
            const key = getKeyIfExists(storeStatus, spreadSheetRow[SpreadSheetMovie.movieStatus]);
            if (key) {
              movie.main.storeConfig.status = key;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.main.storeConfig.status',
                name: 'Movie store status',
                reason: `Could not parse store status : ${spreadSheetRow[SpreadSheetMovie.movieStatus].trim().toLowerCase()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          } else {
            movie.main.storeConfig.status = 'draft';
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.main.storeConfig.status',
              name: 'Movie store status',
              reason: `Store status not found, assumed "${storeStatus.draft}"`,
              hint: 'Edit corresponding sheet field.'
            });
          }

          // USER ID (to override who is creating this title)
          if (spreadSheetRow[SpreadSheetMovie.userId]) {
            movie._meta = createDocumentMeta();
            const uid = spreadSheetRow[SpreadSheetMovie.userId].trim();
            const userExists = await this.authService.userExists(uid);
            if (userExists) {
              movie._meta.createdBy = uid;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie._meta.createdBy',
                name: 'Movie owned id',
                reason: `User Id specified for movie admin does not exists "${uid}"`,
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

    if (movie.main.directors.length === 0) {
      errors.push({
        type: 'error',
        field: 'main.directors',
        name: 'Directors',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.promotionalElements.poster.length === 0) {
      errors.push({
        type: 'error',
        field: 'promotionalElements.poster',
        name: 'Poster',
        reason: 'Required field is missing',
        hint: 'Add poster URL in corresponding column.'
      });
    }

    //////////////////
    // OPTIONAL FIELDS
    //////////////////

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

    let stakeholdersCount = 0;
    Object.keys(movie.main.stakeholders).forEach(k => { stakeholdersCount += k.length });
    if (stakeholdersCount === 0) {
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

    if (!movie.story.synopsis) {
      errors.push({
        type: 'warning',
        field: 'movie.story.synopsis',
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

    if (movie.versionInfo.languages === {}) {
      errors.push({
        type: 'warning',
        field: 'versionInfo.languages',
        name: 'Dubbings | Subtitles | Captions ',
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

    //////////////////
    // ADMIN FIELDS
    //////////////////

    if (this.isUserBlockframesAdmin) {
      if (!movie.salesInfo.scoring) {
        errors.push({
          type: 'warning',
          field: 'salesInfo.scoring',
          name: 'Scoring',
          reason: 'Optional field is missing',
          hint: 'Edit corresponding sheet field.'
        });
      }
    }

    return importErrors;
  }


  public async formatDistributionDeals(sheetTab: SheetTab) {
    this.clearDataSources();
    sheetTab.rows.forEach(async spreadSheetRow => {

      if (spreadSheetRow[SpreadSheetDistributionDeal.internalRef]) {
        const movie = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetDistributionDeal.internalRef]);
        const distributionDeal = createDistributionDeal();

        const importErrors = {
          distributionDeal,
          errors: [],
          movieInternalRef: spreadSheetRow[SpreadSheetDistributionDeal.internalRef],
          movieTitle: movie ? movie.main.title.original : undefined,
          movieId: movie ? movie.id : undefined
        } as DealsImportState;

        if (movie) {

          if (spreadSheetRow[SpreadSheetDistributionDeal.distributionDealId]) {
            distributionDeal.id = spreadSheetRow[SpreadSheetDistributionDeal.distributionDealId];
          } else {
            importErrors.errors.push({
              type: 'error',
              field: 'distributionright.id',
              name: 'Id',
              reason: 'Required field is missing',
              hint: 'Edit corresponding sheet field.'
            });
          }

          /////////////////
          // CONTRACT STUFF
          /////////////////

          // Retreive the contract that will handle the deal
          const contract = await this.contractService.getContractWithLastVersionFromDeal(movie.id, distributionDeal.id);
          if (contract) {

            distributionDeal.contractId = contract.doc.id;

            /////////////////
            // LICENSE STUFF
            /////////////////

            /* LICENSOR */

            // Nothing to do. Should be the same infos already filled in previously imported contract sheet

            /* LICENSEE */

            // Nothing to do. Should be the same infos already filled in previously imported contract sheet

            /////////////////
            // TERMS STUFF
            /////////////////

            // BEGINNING OF RIGHTS
            if (spreadSheetRow[SpreadSheetDistributionDeal.rightsStart]) {
              const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.rightsStart]);
              const dateStart = new Date(`${y}-${m}-${d}`);
              if (isNaN(dateStart.getTime())) { // ie invalid date
                distributionDeal.terms.approxStart = spreadSheetRow[SpreadSheetDistributionDeal.rightsStart];
              } else {
                distributionDeal.terms.start = dateStart
              }
            }

            // END OF RIGHTS
            if (spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd]) {
              const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd]);
              const dateEnd = new Date(`${y}-${m}-${d}`);
              if (isNaN(dateEnd.getTime())) { // ie invalid date
                distributionDeal.terms.approxEnd = spreadSheetRow[SpreadSheetDistributionDeal.rightsEnd];
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
                    'dubbed'
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
                    'subtitle'
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
                    'caption'
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

            // STATUS
            distributionDeal.status = 'draft';

            // EXCLUSIVE DEAL
            if (spreadSheetRow[SpreadSheetDistributionDeal.exclusive]) {
              distributionDeal.exclusive = spreadSheetRow[SpreadSheetDistributionDeal.exclusive].toLowerCase() === 'yes' ? true : false;
            }

            // CATCH UP
            if (spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate] || spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]) {
              distributionDeal.catchUp = createTerms();

              // CATCH UP START
              if (spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate]) {
                const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate]);
                const catchUpStartDate = new Date(`${y}-${m}-${d}`);
                if (isNaN(catchUpStartDate.getTime())) {
                  distributionDeal.catchUp.approxStart = spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate];
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'distributionDeal.catchUp.start',
                    name: 'CatchUp start',
                    reason: `Failed to parse CatchUp start date : ${spreadSheetRow[SpreadSheetDistributionDeal.catchUpStartDate]}, moved data to approxStart`,
                    hint: 'Edit corresponding sheet field.'
                  });
                } else {
                  distributionDeal.catchUp.start = catchUpStartDate;
                }
              }

              // CATCH UP END
              if (spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]) {
                const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]);
                const catchUpEndDate = distributionDeal.catchUp.end = new Date(`${y}-${m}-${d}`);
                if (isNaN(catchUpEndDate.getTime())) {
                  distributionDeal.catchUp.approxEnd = spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate];
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'distributionDeal.catchUp.end',
                    name: 'CatchUp end',
                    reason: `Failed to parse CatchUp end date : ${spreadSheetRow[SpreadSheetDistributionDeal.catchUpEndDate]}, moved data to approxEnd`,
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
                const dateParts = date.trim().match(this.deepDatesRegex);
                let diffusionDate;
                if (dateParts && dateParts.length === 4) {
                  diffusionDate = new Date(`${dateParts[3]}-${dateParts[2]}-${dateParts[1]}`);
                }

                const diffusion = createTerms();

                if (isNaN(diffusionDate.getTime())) {
                  diffusion.approxStart = date;
                  importErrors.errors.push({
                    type: 'warning',
                    field: 'multidiffusion.start',
                    name: 'Multidiffusion start',
                    reason: `Failed to parse multidiffusion start date : ${date}, moved data to approxStart`,
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

                  const holdBackStartParts = holdbackParts[1].trim().match(this.deepDatesRegex);
                  let holdBackStart;
                  if (holdBackStartParts && holdBackStartParts.length === 4) {
                    holdBackStart = new Date(`${holdBackStartParts[3]}-${holdBackStartParts[2]}-${holdBackStartParts[1]}`);
                  }

                  if (isNaN(holdBackStart.getTime())) {
                    holdBack.terms.approxStart = holdbackParts[1].trim();
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.start',
                      name: 'Holdback start',
                      reason: `Failed to parse holdback start date : ${holdbackParts[1].trim()}, moved data to approxStart`,
                      hint: 'Edit corresponding sheet field.'
                    });
                  } else {
                    holdBack.terms.start = holdBackStart;
                  }

                  const holdBackEndParts = holdbackParts[2].trim().match(this.deepDatesRegex);
                  let holdBackEnd;
                  if (holdBackEndParts && holdBackEndParts.length === 4) {
                    holdBackEnd = new Date(`${holdBackEndParts[3]}-${holdBackEndParts[2]}-${holdBackEndParts[1]}`);
                  }

                  if (isNaN(holdBackEnd.getTime())) {
                    holdBack.terms.approxEnd = holdbackParts[2].trim();
                    importErrors.errors.push({
                      type: 'warning',
                      field: 'holdback.end',
                      name: 'Holdback end',
                      reason: `Failed to parse holdback end date : ${holdbackParts[2].trim()}, moved data to approxEnd`,
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

        this.cdRef.markForCheck();
      }

    });
  }

  private async validateMovieSale(importErrors: DealsImportState): Promise<DealsImportState> {
    const distributionDeal = importErrors.distributionDeal;
    const errors = importErrors.errors;

    // No movie found
    if (!importErrors.movieTitle) {
      return importErrors;
    }

    //////////////////
    // REQUIRED FIELDS
    //////////////////

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

            // SHOW NAME
            if (spreadSheetRow[SpreadSheetContract.displayLicenseeName]) {
              licensee.party.showName = spreadSheetRow[SpreadSheetContract.displayLicenseeName].toLowerCase() === 'yes' ? true : false;
            }

            contract.doc.parties.push(licensee);
          }

          // CHILD ROLES
          if (spreadSheetRow[SpreadSheetContract.childRoles]) {
            spreadSheetRow[SpreadSheetContract.childRoles].split(this.separator).forEach((r: string) => {
              const childRoleParts = r.split(this.subSeparator);
              const partyName = childRoleParts.shift().trim();
              const party = contract.doc.parties.find(p => p.party.displayName === partyName && p.party.role === getCodeIfExists('LEGAL_ROLES', 'licensor'));
              if (party) {
                childRoleParts.forEach(childRole => {
                  const role = getCodeIfExists('SUB_LICENSOR_ROLES', childRole.trim() as ExtractCode<'SUB_LICENSOR_ROLES'>);
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

          // CONTRACT TYPE
          if (spreadSheetRow[SpreadSheetContract.contractType]) {
            const key = getKeyIfExists(contractType, spreadSheetRow[SpreadSheetContract.contractType]);
            if (key) {
              contract.doc.type = key;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'contract.type',
                name: 'Contract Type',
                reason: `Could not parse contract type : ${spreadSheetRow[SpreadSheetContract.contractType].trim().toLowerCase()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'contract.type',
              name: 'Contract Type',
              reason: 'Optional field is missing',
              hint: 'Edit corresponding sheet field.'
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
          const key = getKeyIfExists(contractStatus, spreadSheetRow[SpreadSheetContract.status]);
          if (key) {
            contract.last.status = key;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'contract.last.status ',
              name: 'Contract Status',
              reason: `Contract status "${spreadSheetRow[SpreadSheetContract.status]}" could not be parsed.`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        }

        // CONTRACT CREATION DATE
        if (spreadSheetRow[SpreadSheetContract.creationDate]) {
          const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.creationDate]);
          contract.last.creationDate = new Date(`${y}-${m}-${d}`);
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
          const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.scopeStartDate]);
          const scopeStart = new Date(`${y}-${m}-${d}`);
          if (isNaN(scopeStart.getTime())) {
            contract.last.scope.approxStart = spreadSheetRow[SpreadSheetContract.scopeStartDate];
            importErrors.errors.push({
              type: 'warning',
              field: 'contract.last.scope',
              name: 'Contract scope start',
              reason: `Failed to parse contract scope start date : ${spreadSheetRow[SpreadSheetContract.scopeStartDate]}, moved data to approxStart`,
              hint: 'Edit corresponding sheet field.'
            });
          } else {
            contract.last.scope.start = scopeStart;
          }
        }

        // SCOPE DATE END
        if (spreadSheetRow[SpreadSheetContract.scopeEndDate]) {
          const { y, m, d } = SSF.parse_date_code(spreadSheetRow[SpreadSheetContract.scopeEndDate]);
          const scopeEnd = new Date(`${y}-${m}-${d}`);
          if (isNaN(scopeEnd.getTime())) {
            contract.last.scope.approxEnd = spreadSheetRow[SpreadSheetContract.scopeEndDate];
            importErrors.errors.push({
              type: 'warning',
              field: 'contract.last.scope',
              name: 'Contract scope end',
              reason: `Failed to parse contract scope end date : ${spreadSheetRow[SpreadSheetContract.scopeEndDate]}, moved data to approxEnd`,
              hint: 'Edit corresponding sheet field.'
            });
          } else {
            contract.last.scope.end = scopeEnd;
          }
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
                paymentSchedule.date.approxStart = scheduleParts[2].trim();
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
          const titleDetails = await this.processTitleDetails(spreadSheetRow, currentIndex, importErrors);

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
          }
        }


        ///////////////
        // VALIDATION
        ///////////////

        // Global contract price
        const contractPrice = createPrice();
        importErrors.contract.doc.titleIds.forEach(titleId => {
          const price = importErrors.contract.last.titles[titleId].price;
          if (price && price.amount) {
            contractPrice.amount += price.amount;
          }
          if (price && price.currency) {
            contractPrice.currency = price.currency;
          }
        });

        importErrors.contract.last.price = contractPrice;

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

        this.cdRef.markForCheck();
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

    // SCOPE
    if (Object.entries(contract.last.scope).length === 0 && contract.last.scope.constructor === Object) {
      importErrors.errors.push({
        type: 'error',
        field: 'contract.last.scope',
        name: 'Scope Start',
        reason: 'Contract scope not defined',
        hint: 'Edit corresponding sheet field.'
      });
    }

    //////////////////
    // OPTIONAL FIELDS
    //////////////////

    // CONTRACT PRICE VALIDATION
    if (!contract.last.price.amount) {
      errors.push({
        type: 'warning',
        field: 'price',
        name: 'Contract price',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

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

  private async processTitleDetails(spreadSheetRow: any[], currentIndex: number, importErrors: ContractsImportState): Promise<ContractTitleDetail> {
    const titleDetails = createContractTitleDetail();
    titleDetails.price.recoupableExpenses = [];

    let internalRef;
    if (spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]) {
      internalRef = spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex];
      const title = await this.movieService.getFromInternalRef(internalRef);
      if (title === undefined) {
        throw new Error(`Movie ${spreadSheetRow[SpreadSheetContractTitle.titleCode + currentIndex]} is missing in database.`);
      }
      titleDetails.titleId = title.id;
    }

    if (spreadSheetRow[SpreadSheetContractTitle.licensedRightIds + currentIndex]) {
      titleDetails.distributionDealIds = spreadSheetRow[SpreadSheetContractTitle.licensedRightIds + currentIndex]
        .split(this.separator)
        .map(c => c.trim());
    }

    if (spreadSheetRow[SpreadSheetContractTitle.titlePrice + currentIndex]) {
      const priceParts = spreadSheetRow[SpreadSheetContractTitle.titlePrice + currentIndex].split(this.subSeparator);

      // Check if priceParts have at least two parts (amount and currency)
      if (priceParts.length >= 2) {
        const amount = parseInt(priceParts[0], 10);
        const currency = getCodeIfExists('MOVIE_CURRENCIES', priceParts[1]);
        titleDetails.price.amount = amount;
        if (currency) {
          titleDetails.price.currency = currency;
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'title.price',
            name: 'Title price currency',
            reason: `Failed to parse currency : ${priceParts[1]} for ${internalRef}`,
            hint: 'Edit corresponding sheet field.'
          });
        }
      } else {
        importErrors.errors.push({
          type: 'warning',
          field: 'title.price',
          name: 'Title price',
          reason: `Failed to parse title price ${spreadSheetRow[SpreadSheetContractTitle.titlePrice + currentIndex]} for ${internalRef}`,
          hint: 'Edit corresponding sheet field.'
        });
      }
    } else {
      importErrors.errors.push({
        type: 'warning',
        field: 'title.price',
        name: 'Title price',
        reason: `Title price not found for ${internalRef}`,
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (spreadSheetRow[SpreadSheetContractTitle.commission + currentIndex]) {
      titleDetails.price.commission = spreadSheetRow[SpreadSheetContractTitle.commission + currentIndex]
    }

    const recoupableExpense = createExpense();
    if (spreadSheetRow[SpreadSheetContractTitle.expenseLabel + currentIndex]) {
      recoupableExpense.label = spreadSheetRow[SpreadSheetContractTitle.expenseLabel + currentIndex];
    }

    if (spreadSheetRow[SpreadSheetContractTitle.expenseValue + currentIndex]) {
      recoupableExpense.price.amount = spreadSheetRow[SpreadSheetContractTitle.expenseValue + currentIndex];
    }

    if (spreadSheetRow[SpreadSheetContractTitle.expenseCurrency + currentIndex]) {
      const currency = getCodeIfExists('MOVIE_CURRENCIES', spreadSheetRow[SpreadSheetContractTitle.expenseCurrency + currentIndex]);
      if (currency) {
        recoupableExpense.price.currency = currency;
      } else {
        importErrors.errors.push({
          type: 'warning',
          field: 'recoupableExpense.price.currency',
          name: 'Expense currency',
          reason: `Failed to parse expense currency : ${spreadSheetRow[SpreadSheetContractTitle.expenseCurrency + currentIndex]} for ${internalRef}`,
          hint: 'Edit corresponding sheet field.'
        });
      }
    }

    titleDetails.price.recoupableExpenses.push(recoupableExpense);

    return titleDetails;
  }

  public openIntercom(): void {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
    this.deals.data = [];
  }
}
