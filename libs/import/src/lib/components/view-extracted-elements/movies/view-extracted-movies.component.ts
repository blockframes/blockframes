import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  Movie,
  createMovieMain,
  createMoviePromotionalDescription,
  createMovieSalesCast,
  createMovieSalesInfo,
  createMovieFestivalPrizes,
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
} from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatCredits } from '@blockframes/utils/spreadsheet/format';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
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
import { createRange, createPrice } from '@blockframes/utils/common-interfaces';
import { Intercom } from 'ng-intercom';
import { cleanModel, getKeyIfExists } from '@blockframes/utils/helpers';
import { ImageUploader } from '@blockframes/utils/media/media.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieImportState } from '../../../import-utils';
import { createDistributionRight } from '@blockframes/distribution-rights/+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { UserService } from '@blockframes/user/+state/user.service';

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
  // FESTIVAL FIELDS
  //////////////////
  territories,
  territoriesExcluded,

  //////////////////
  // ADMIN FIELDS
  //////////////////

  scoring,
  storeType,
  movieStatus,
  userId,
}

@Component({
  selector: 'import-view-extracted-movies',
  templateUrl: './view-extracted-movies.component.html',
  styleUrls: ['./view-extracted-movies.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class ViewExtractedMoviesComponent implements OnInit {

  public moviesToCreate = new MatTableDataSource<MovieImportState>();
  public moviesToUpdate = new MatTableDataSource<MovieImportState>();

  private separator = ';';
  private subSeparator = ',';
  private deepDatesRegex = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-](\d{4})$/;
  public isUserBlockframesAdmin = false;

  constructor(
    @Optional() private intercom: Intercom,
    private movieService: MovieService,
    private imageUploader: ImageUploader,
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

  public format(sheetTab: SheetTab) {
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
              versionParts.map(v => v.trim()).forEach((v: MovieLanguageTypesValue) => {
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
                movie.budget.totalBudget.currency = getCodeIfExists('MOVIE_CURRENCIES', 'USD');
                break;
              case '€':
              default:
                movie.budget.totalBudget.currency = getCodeIfExists('MOVIE_CURRENCIES', 'EUR');
                break;
            }

            movie.budget.estimatedBudget = createRange({ from: from * 1000000, to: to * 1000000, label: spreadSheetRow[SpreadSheetMovie.budget] });
          } else {
            movie.budget.totalBudget = createPrice({
              amount: parseInt(spreadSheetRow[SpreadSheetMovie.budget], 10)
            });
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
            media: await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.bannerLink]), // @TODO (##2987)
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
        // FESTIVAL FIELDS
        //////////////////
        if (spreadSheetRow[SpreadSheetMovie.territories] || spreadSheetRow[SpreadSheetMovie.territoriesExcluded]) {
          // Here we need to create 'lite' version of distribution deals with only the reserved territories.
          // This feature is used on festival app.

          const distributionRight = createDistributionRight();
          // TERRITORIES
          if (spreadSheetRow[SpreadSheetMovie.territories]) {
            distributionRight.territory = [];
            spreadSheetRow[SpreadSheetMovie.territories].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
              const territory = getCodeIfExists('TERRITORIES', c);
              if (territory) {
                distributionRight.territory.push(territory);
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
          if (spreadSheetRow[SpreadSheetMovie.territoriesExcluded]) {
            distributionRight.territoryExcluded = [];
            spreadSheetRow[SpreadSheetMovie.territoriesExcluded].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
              const territory = getCodeIfExists('TERRITORIES', c);
              if (territory) {
                distributionRight.territoryExcluded.push(territory);
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

          // We keep it for save in the next component
          importErrors.distributionRights = [distributionRight];
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
            const userExists = await this.userService.userExists(uid);
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

  public openIntercom(): void {
    return this.intercom.show();
  }

  private clearDataSources() {
    this.moviesToCreate.data = [];
    this.moviesToUpdate.data = [];
  }
}
