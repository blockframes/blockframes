import { Component, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, Optional } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import {
  Movie,
  MovieService,
  createDocumentMeta,
  createMovieRating,
  createMovieReview,
  createMovieOriginalRelease,
  createPrize,
  populateMovieLanguageSpecification,
  createBoxOffice,
  createMovie,
} from '@blockframes/movie/+state';
import { SheetTab } from '@blockframes/utils/spreadsheet';
import { formatCredits } from '@blockframes/utils/spreadsheet/format';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import {
  PremiereType,
  MovieLanguageTypesValue,
  UnitBoxValue,
  staticConsts,
  MovieCurrencies,
  Rating,
  SoundFormat,
  Scoring,
  Colors,
  MovieFormatQuality,
  MovieFormat,
  Certifications
} from '@blockframes/utils/static-model';
import { getKeyFromValue } from '@blockframes/utils/static-model/staticConsts';
import { createStakeholder } from '@blockframes/utils/common-interfaces/identity';
import { createRange } from '@blockframes/utils/common-interfaces';
import { Intercom } from 'ng-intercom';
import { cleanModel, getKeyIfExists } from '@blockframes/utils/helpers';
// import { ImageUploader } from '@blockframes/media/+state/image-uploader.service'; TODO issue #3091
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieImportState } from '../../../import-utils';
import { createDistributionRight } from '@blockframes/distribution-rights/+state';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { UserService } from '@blockframes/user/+state/user.service';

enum SpreadSheetMovie {
  internationalTitle,
  originalTitle,
  internalRef,
  contentType,
  productionStatus,
  directors,
  originCountries,
  stakeholdersWithRole,
  originCountryReleaseDate,
  languages,
  genres,
  length,
  cast,
  festivalCustomPrizes,
  synopsis,
  keyAssets,
  keywords,
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
  // poster, TODO issue #3091
  // bannerLink, TODO issue #3091
  // stillLinks, TODO issue #3091
  // presentationDeck, TODO issue #3091
  // scenarioLink, TODO issue #3091
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

  public format(sheetTab: SheetTab) {
    this.clearDataSources();

    sheetTab.rows.forEach(async spreadSheetRow => {
      if (spreadSheetRow[SpreadSheetMovie.originalTitle] && spreadSheetRow[SpreadSheetMovie.internalRef]) {
        const existingMovie = await this.movieService.getFromInternalRef(spreadSheetRow[SpreadSheetMovie.internalRef]);
        const movie = existingMovie ? cleanModel(existingMovie) as Movie : createMovie();
        const importErrors = { movie, errors: [] } as MovieImportState;

        //////////////////
        // REQUIRED FIELDS
        //////////////////

        // INTERNAL REF (Film Code)
        movie.internalRef = spreadSheetRow[SpreadSheetMovie.internalRef];

        // WORK TYPE
        if (spreadSheetRow[SpreadSheetMovie.contentType]) {
          const key = getKeyIfExists(staticConsts.contentType, spreadSheetRow[SpreadSheetMovie.contentType]);
          if (key) {
            movie.contentType = key;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.contentType',
              name: 'Work Type',
              reason: `Could not parse work type : ${spreadSheetRow[SpreadSheetMovie.contentType].trim().toLowerCase()}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        }

        // ORIGINAL TITLE (Original Title)
        if (spreadSheetRow[SpreadSheetMovie.originalTitle]) {
          movie.title.original = spreadSheetRow[SpreadSheetMovie.originalTitle];
        }

        // DIRECTORS (Director(s))
        if (spreadSheetRow[SpreadSheetMovie.directors]) {
          movie.directors = formatCredits(spreadSheetRow[SpreadSheetMovie.directors], this.separator, this.subSeparator);
        }

        // TODO issue #3091
        // POSTER (Poster)
        // TODO issue 3091
        // const poster = await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.poster]);
        // const moviePoster = createPromotionalImage({
        //   label: 'Poster',
        //   media: poster,
        // });
        // movie.poster = moviePoster;

        //////////////////
        // OPTIONAL FIELDS
        //////////////////

        // INTERNATIONAL TITLE (International Title)
        if (spreadSheetRow[SpreadSheetMovie.internationalTitle]) {
          movie.title.international = spreadSheetRow[SpreadSheetMovie.internationalTitle];
        }

        // Total Run Time
        if (spreadSheetRow[SpreadSheetMovie.length]) {
          if (!isNaN(Number(spreadSheetRow[SpreadSheetMovie.length]))) {
            movie.runningTime.time = parseInt(spreadSheetRow[SpreadSheetMovie.length], 10);
          } else {
            movie.runningTime.time = spreadSheetRow[SpreadSheetMovie.length]; // Exemple value: TBC
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
                  field: 'movie.stakeholders',
                  name: 'Stakeholders',
                  reason: `${stakeHolderParts[2]} not found in territories list`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            }
            if (role) {
              switch (role) {
                case 'broadcaster-coproducer':
                  movie.stakeholders.broadcasterCoproducer.push(stakeHolder);
                  break;
                case 'financier':
                  movie.stakeholders.financier.push(stakeHolder);
                  break;
                case 'laboratory':
                  movie.stakeholders.laboratory.push(stakeHolder);
                  break;
                case 'sales-agent':
                  movie.stakeholders.salesAgent.push(stakeHolder);
                  break;
                case 'distributor':
                  movie.stakeholders.distributor.push(stakeHolder);
                  break;
                case 'line-producer':
                  movie.stakeholders.lineProducer.push(stakeHolder);
                  break;
                case 'co-producer':
                  movie.stakeholders.coProductionCompany.push(stakeHolder);
                  break;
                case 'executive-producer':
                default:
                  movie.stakeholders.productionCompany.push(stakeHolder);
                  break;
              }
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.stakeholders',
                name: 'Stakeholders',
                reason: `${stakeHolderParts[1]} not found in Stakeholders roles list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // COLOR (Color / Black & White )
        if (spreadSheetRow[SpreadSheetMovie.color]) {
          const color = getKeyFromValue('colors', spreadSheetRow[SpreadSheetMovie.color]) as Colors;
          if (color) {
            movie.color = color;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'color',
              name: 'Color',
              reason: `${spreadSheetRow[SpreadSheetMovie.color]} not found in colors list`,
              hint: 'Edit corresponding sheet field.'
            });

          }
        }

        // ORIGIN COUNTRIES (Countries of Origin)
        if (spreadSheetRow[SpreadSheetMovie.originCountries]) {
          movie.originCountries = [];
          spreadSheetRow[SpreadSheetMovie.originCountries].split(this.separator).forEach((c: ExtractCode<'TERRITORIES'>) => {
            const country = getCodeIfExists('TERRITORIES', c);
            if (country) {
              movie.originCountries.push(country);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'originCountries',
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
              const system = getKeyFromValue('rating', ratingParts[2]) as Rating;

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

            movie.rating.push(movieRating);
          });
        }

        // FILM REVIEW
        if (spreadSheetRow[SpreadSheetMovie.filmReviews]) {
          movie.review = [];
          spreadSheetRow[SpreadSheetMovie.filmReviews].split(this.separator).forEach(review => {
            const filmReviewParts = review.split(this.subSeparator);
            if (filmReviewParts.length >= 3) {
              const movieReview = createMovieReview({
                journalName: filmReviewParts[0].trim(),
                revueLink: filmReviewParts[1].trim(),
                criticQuote: filmReviewParts[2].trim()
              })

              movie.review.push(movieReview);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'movie.review',
                name: 'Movie review',
                reason: `Could not parse review : ${review}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          })
        };

        // SHOOTING FORMAT
        if (spreadSheetRow[SpreadSheetMovie.shootingFormat]) {
          const shootingFormat = getKeyFromValue('movieFormat', spreadSheetRow[SpreadSheetMovie.shootingFormat].toString().trim()) as MovieFormat;
          if (shootingFormat) {
            movie.format = shootingFormat;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.format',
              name: 'Shooting format',
              reason: `Could not parse ${spreadSheetRow[SpreadSheetMovie.shootingFormat]}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        };

        // AVAILABLE FORMAT (formatQuality)
        if (spreadSheetRow[SpreadSheetMovie.availableFormat]) {
          const availableFormat = getKeyFromValue('movieFormatQuality', spreadSheetRow[SpreadSheetMovie.availableFormat].trim()) as MovieFormatQuality;
          if (availableFormat) {
            movie.formatQuality = availableFormat;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.formatQuality',
              name: 'formatQuality',
              reason: `Could not parse ${spreadSheetRow[SpreadSheetMovie.availableFormat]}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        };

        // AVAILABLE FORMAT (soundQuality)
        if (spreadSheetRow[SpreadSheetMovie.soundQuality]) {
          const soundQuality = getKeyFromValue('soundFormat', spreadSheetRow[SpreadSheetMovie.soundQuality].trim()) as SoundFormat;
          if (soundQuality) {
            movie.soundFormat = soundQuality;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.soundQuality',
              name: 'soundQuality',
              reason: `Could not parse ${spreadSheetRow[SpreadSheetMovie.soundQuality]}`,
              hint: 'Edit corresponding sheet field.'
            });
          }
        };

        // CERTIFICATIONS (Certifications)
        if (spreadSheetRow[SpreadSheetMovie.quotas]) {
          spreadSheetRow[SpreadSheetMovie.quotas].split(this.separator).forEach((c) => {
            const certification = getKeyFromValue('certifications', c) as Certifications;
            if (certification) {
              movie.certifications.push(certification);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'certifications',
                name: 'Certifications',
                reason: `${c} not found in certifications list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });

        }

        // CREDITS (Principal Cast)
        if (spreadSheetRow[SpreadSheetMovie.cast]) {
          movie.cast = formatCredits(spreadSheetRow[SpreadSheetMovie.cast], this.separator, '\\s+', 'CAST_ROLES');
        }

        // CREDITS (Producers)
        if (spreadSheetRow[SpreadSheetMovie.producers]) {
          movie.producers = formatCredits(spreadSheetRow[SpreadSheetMovie.producers], this.separator, this.subSeparator, 'PRODUCER_ROLES');
        }

        // CREDITS (Crew members)
        if (spreadSheetRow[SpreadSheetMovie.crewMembers]) {
          movie.crew = formatCredits(spreadSheetRow[SpreadSheetMovie.crewMembers], this.separator, this.subSeparator, 'CREW_ROLES');
        }

        // SYNOPSIS (Synopsis)
        if (spreadSheetRow[SpreadSheetMovie.synopsis]) {
          movie.synopsis = spreadSheetRow[SpreadSheetMovie.synopsis];
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


            movie.originalRelease.push(originalRelease);
          });
        }

        // GENRES (Genres)
        if (spreadSheetRow[SpreadSheetMovie.genres]) {
          movie.genres = [];
          spreadSheetRow[SpreadSheetMovie.genres].split(this.separator).forEach((g: ExtractCode<'GENRES'>) => {
            const genre = getCodeIfExists('GENRES', g);
            if (genre) {
              movie.genres.push(genre);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'genres',
                name: 'Genres',
                reason: `${g} not found in genres list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // PRIZES (Prizes)
        if (spreadSheetRow[SpreadSheetMovie.festivalCustomPrizes]) {
          movie.customPrizes = [];
          spreadSheetRow[SpreadSheetMovie.festivalCustomPrizes].split(this.separator).forEach(async (p: string) => {
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
                    prize.premiere = getKeyIfExists(staticConsts.premiereType, prizeParts[3] as PremiereType);
                    break;
                }

              }
              movie.customPrizes.push(prize);
            }
          });
        }

        // KEY ASSETS (Key Assets)
        if (spreadSheetRow[SpreadSheetMovie.keyAssets]) {
          movie.keyAssets = spreadSheetRow[SpreadSheetMovie.keyAssets];
        }

        // KEYWORDS
        if (spreadSheetRow[SpreadSheetMovie.keywords]) {
          movie.keywords = [];
          spreadSheetRow[SpreadSheetMovie.keywords].split(this.separator).forEach((k: string) => {
            movie.keywords.push(k);
          });
        }

        // LANGUAGES (Original Language(s))
        if (spreadSheetRow[SpreadSheetMovie.languages]) {
          movie.originalLanguages = [];
          spreadSheetRow[SpreadSheetMovie.languages].split(this.separator).forEach((g: ExtractCode<'LANGUAGES'>) => {
            const language = getCodeIfExists('LANGUAGES', g);
            if (language) {
              movie.originalLanguages.push(language);
              populateMovieLanguageSpecification(movie.languages, language, 'original', true);
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'originalLanguages',
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
                const key = getKeyIfExists(staticConsts.movieLanguageTypes, v);
                if (key) {
                  populateMovieLanguageSpecification(movie.languages, language, key, true);
                } else {
                  parseErrors.push(v.toLowerCase());
                }
              });

              if (parseErrors.length) {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'movie.languages',
                  name: 'Available version(s)',
                  reason: `Could not parse: ${parseErrors.join(', ')}`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'movie.languages',
                name: 'Available version(s)',
                reason: `${languageTemp} not found in languages list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // SCREENER LINK
        if (spreadSheetRow[SpreadSheetMovie.screenerLink]) {
          movie.promotional.screener_link = spreadSheetRow[SpreadSheetMovie.screenerLink];
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
          movie.promotional.promo_reel_link = spreadSheetRow[SpreadSheetMovie.promoReelLink];
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
          movie.promotional.trailer_link = spreadSheetRow[SpreadSheetMovie.trailerLink];
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
          movie.promotional.teaser_link = spreadSheetRow[SpreadSheetMovie.pitchTeaserLink];
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Pitch teaser link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }

        // TODO issue #3091
        /*
        // SCENARIO LINK
        if (spreadSheetRow[SpreadSheetMovie.scenarioLink]) {
          // TODO issue#3091
          movie.promotional.scenario = spreadSheetRow[SpreadSheetMovie.scenarioLink];
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Scenario link',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }*/

        // PRODUCTION STATUS
        if (spreadSheetRow[SpreadSheetMovie.productionStatus]) {
          const movieStatus = staticConsts['productionStatus'][spreadSheetRow[SpreadSheetMovie.productionStatus]];
          if (movieStatus) {
            movie.productionStatus = movieStatus;
          } else {
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.productionStatus',
              name: 'Production status',
              reason: 'Production status could not be parsed',
              hint: 'Edit corresponding sheet field.'
            });
          }
        } else {
          movie.productionStatus = "finished";
          importErrors.errors.push({
            type: 'warning',
            field: 'movie.productionStatus',
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
                movie.totalBudget.currency = getKeyFromValue('movieCurrencies', 'USD') as MovieCurrencies;
                break;
              case '€':
              default:
                movie.totalBudget.currency = getKeyFromValue('movieCurrencies', 'EUR') as MovieCurrencies;
                break;
            }

            movie.estimatedBudget = createRange({ from: from * 1000000, to: to * 1000000, label: spreadSheetRow[SpreadSheetMovie.budget] });
          } else {
            movie.totalBudget = {
              others: parseInt(spreadSheetRow[SpreadSheetMovie.budget], 10),
            };
          }
        }

        movie.boxOffice = [];
        // WORLDWIDE BOX OFFICE
        if (spreadSheetRow[SpreadSheetMovie.worldwideBoxOffice]) {
          spreadSheetRow[SpreadSheetMovie.worldwideBoxOffice].split(this.separator).forEach((version: string) => {
            const boxOfficeParts = version.split(this.subSeparator);
            const unit = getKeyIfExists(staticConsts.unitBox, boxOfficeParts[0] as UnitBoxValue);
            if (unit) {
              movie.boxOffice.push(createBoxOffice(
                {
                  unit,
                  value: boxOfficeParts[1] ? parseInt(boxOfficeParts[1], 10) : 0,
                  territory: getCodeIfExists('TERRITORIES', 'world')
                }
              ));
            } else {
              importErrors.errors.push({
                type: 'warning',
                field: 'movie.boxOffice',
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
              const unit = getKeyIfExists(staticConsts.unitBox, boxOfficeParts[1] as UnitBoxValue);
              if (unit) {
                movie.boxOffice.push(createBoxOffice(
                  {
                    unit,
                    value: boxOfficeParts[2] ? parseInt(boxOfficeParts[2], 10) : 0,
                    territory: territory
                  }
                ));
              } else {
                importErrors.errors.push({
                  type: 'warning',
                  field: 'movie.boxOffice',
                  name: 'Box office',
                  reason: `Could not parse national box office UnitBox : ${boxOfficeParts[1].trim()}`,
                  hint: 'Edit corresponding sheet field.'
                });
              }
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.boxOffice',
                name: 'National Box office',
                reason: `Could not parse box office territory : ${boxOfficeParts[0].trim()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          });
        }

        // TODO issue #3091
        // IMAGE BANNIERE LINK
        // if (spreadSheetRow[SpreadSheetMovie.bannerLink]) {
        //   const promotionalElement = createPromotionalImage({
        //     label: 'Banner',
        //     media: await this.imageUploader.upload(spreadSheetRow[SpreadSheetMovie.bannerLink]), // @TODO (##2987)
        //     ratio: 'rectangle'
        //   });
        //   movie.banner = promotionalElement;
        // } else {
        //   importErrors.errors.push({
        //     type: 'warning',
        //     field: 'main',
        //     name: 'Banner',
        //     reason: 'Optional field is missing',
        //     hint: 'Edit corresponding sheet field.'
        //   });
        // }

        // TODO issue #3091
        // IMAGE STILLS LINK
        // if (spreadSheetRow[SpreadSheetMovie.stillLinks]) {
        //   movie.promotional.still_photo = {};
        //   for (const still of spreadSheetRow[SpreadSheetMovie.stillLinks].split(this.separator)) {
        //     const media = await this.imageUploader.upload(still);
        //     const element = createPromotionalImage({ label: 'Still', media });
        //     const stillPhotoKey = `${Object.keys(movie.promotional.still_photo).length}`
        //     movie.promotional.still_photo[stillPhotoKey] = element;
        //   }
        // } else {
        //   importErrors.errors.push({
        //     type: 'warning',
        //     field: 'promotionalElements',
        //     name: 'Stills',
        //     reason: 'Optional field is missing',
        //     hint: 'Edit corresponding sheet field.'
        //   });
        // }

        // PRESENTATION DECK
        // TODO issue #3091
        /*if (spreadSheetRow[SpreadSheetMovie.presentationDeck]) {
          // TODO issue#3091
          movie.promotional.presentation_deck = spreadSheetRow[SpreadSheetMovie.presentationDeck];
        } else {
          importErrors.errors.push({
            type: 'warning',
            field: 'promotionalElements',
            name: 'Presentation deck',
            reason: 'Optional field is missing',
            hint: 'Edit corresponding sheet field.'
          });
        }*/

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
            const scoring = getKeyFromValue('scoring', spreadSheetRow[SpreadSheetMovie.scoring]) as Scoring;
            if (scoring) {
              movie.scoring = scoring;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'scoring',
                name: 'Scoring',
                reason: `${spreadSheetRow[SpreadSheetMovie.scoring]} not found in scoring list`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          }

          // STORE TYPE
          if (spreadSheetRow[SpreadSheetMovie.storeType]) {
            const key = getKeyIfExists(staticConsts.storeType, spreadSheetRow[SpreadSheetMovie.storeType]);
            if (key) {
              movie.storeConfig.storeType = key;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.storeConfig.storeType',
                name: 'Movie store type',
                reason: `Could not parse store type : ${spreadSheetRow[SpreadSheetMovie.storeType].trim().toLowerCase()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          } else {
            movie.storeConfig.storeType = 'line_up';
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.storeConfig.storeType',
              name: 'Movie store type',
              reason: `Store type not found, assumed "${staticConsts.storeType.line_up}"`,
              hint: 'Edit corresponding sheet field.'
            });
          }

          // MOVIE STATUS
          if (spreadSheetRow[SpreadSheetMovie.movieStatus]) {
            const key = getKeyIfExists(staticConsts.storeStatus, spreadSheetRow[SpreadSheetMovie.movieStatus]);
            if (key) {
              movie.storeConfig.status = key;
            } else {
              importErrors.errors.push({
                type: 'error',
                field: 'movie.storeConfig.status',
                name: 'Movie store status',
                reason: `Could not parse store status : ${spreadSheetRow[SpreadSheetMovie.movieStatus].trim().toLowerCase()}`,
                hint: 'Edit corresponding sheet field.'
              });
            }
          } else {
            movie.storeConfig.status = 'draft';
            importErrors.errors.push({
              type: 'warning',
              field: 'movie.storeConfig.status',
              name: 'Movie store status',
              reason: `Store status not found, assumed "${staticConsts.storeStatus.draft}"`,
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

    if (!movie.internalRef) {
      errors.push({
        type: 'error',
        field: 'internalRef',
        name: 'Film Code ',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.title.original) {
      errors.push({
        type: 'error',
        field: 'title.original',
        name: 'Original title',
        reason: 'Required field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.directors.length === 0) {
      errors.push({
        type: 'error',
        field: 'directors',
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

    if (!movie.title.international) {
      errors.push({
        type: 'warning',
        field: 'title.international',
        name: 'International title',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.runningTime) {
      errors.push({
        type: 'warning',
        field: 'runningTime',
        name: 'Total Run Time',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    let stakeholdersCount = 0;
    Object.keys(movie.stakeholders).forEach(k => { stakeholdersCount += k.length });
    if (stakeholdersCount === 0) {
      errors.push({
        type: 'warning',
        field: 'stakeholders',
        name: 'Stakeholder(s)',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.color) {
      errors.push({
        type: 'warning',
        field: 'color',
        name: 'Color / Black & White ',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.originCountries.length === 0) {
      errors.push({
        type: 'warning',
        field: 'originCountries',
        name: 'Countries of origin',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (!movie.certifications) {
      errors.push({
        type: 'warning',
        field: 'certifications',
        name: 'Certifications',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.rating.length === 0) {
      errors.push({
        type: 'warning',
        field: 'rating',
        name: 'Rating',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.cast.length === 0) {
      errors.push({
        type: 'warning',
        field: 'cast',
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
        field: 'genres',
        name: 'Genres',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.customPrizes.length === 0) {
      errors.push({
        type: 'warning',
        field: 'prizes',
        name: 'Festival Prizes',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.keyAssets.length === 0) {
      errors.push({
        type: 'warning',
        field: 'keyAssets',
        name: 'Key assets',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.keywords.length === 0) {
      errors.push({
        type: 'warning',
        field: 'keywords',
        name: 'Keywords',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.originalLanguages.length === 0) {
      errors.push({
        type: 'warning',
        field: 'originalLanguages',
        name: 'Languages',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.languages === {}) {
      errors.push({
        type: 'warning',
        field: 'languages',
        name: 'Dubbings | Subtitles | Captions ',
        reason: 'Optional field is missing',
        hint: 'Edit corresponding sheet field.'
      });
    }

    if (movie.totalBudget === undefined) {
      errors.push({
        type: 'warning',
        field: 'totalBudget',
        name: 'Budget',
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
          field: 'scoring',
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
