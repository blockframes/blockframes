import isEqual from 'lodash/isEqual';
import sortBy from 'lodash/sortBy';
import includes from 'lodash/includes';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Router } from '@angular/router';
import { Movie, MovieQuery, MovieSale } from '@blockframes/movie/movie/+state';
import {
  MEDIAS_SLUG,
  MediasSlug,
  TERRITORIES_SLUG,
  TerritoriesSlug,
  LanguagesSlug
} from '@blockframes/movie/movie/static-model/types';
import { DateRange } from '@blockframes/utils';
import { CatalogBasket, createBaseBasket, createDistributionRight } from '../+state/basket.model';
import { BasketService } from '../+state/basket.service';
import {
  hasSalesRights,
  FilteredResponse,
  exclusiveMovieSales,
  hasExclusiveTerritoriesInCommon,
  hasExclusiveDateRangeSales,
  hasTerritoriesInCommon,
  salesAgentHasDateRange,
  hasMediaInCommon
} from './availabilities.util';
import { DistributionRightForm } from './create.form';

enum ResearchSteps {
  START = 'Start',
  ERROR = 'ERROR',
  POSSIBLE = 'POSSBILE'
}

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightCreateComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'distribution-right';

  // Enum for tracking the current research state
  public steps = ResearchSteps;
  public step: ResearchSteps = this.steps.START;

  // Subscription for value changes in the distribution right form
  private formSubscription: Subscription;

  // Subscription for the results in the research form
  private researchSubscription: Subscription;

  // Form for holding users distribution rights choice
  public form = new DistributionRightForm();

  // Movie for information to display
  public movie$: Observable<Movie>;

  // This variable is going to be passed down to the catalog-form-selection table component
  public catalogBasket: CatalogBasket;

  // A flag to indicate if datepicker is open
  public opened = false;

  /**
   * This variable will be input the dates inside of the datepicker
   * if the users types it in manually
   */
  public choosenDateRange: DateRange = { to: new Date(), from: new Date() };

  // This variable contains the dates which the movie is already bought
  public occupiedDateRanges: DateRange[] = [];

  // Datepicker section
  public disabledDates: Date;

  // Media section
  public movieMedia: MediasSlug[] = MEDIAS_SLUG;

  // Language section
  // TODO(MF): Think of a slim solution
  public languageControl = new FormControl(null);
  public dubbingsControl = new FormControl(null);
  public subtitlesControl = new FormControl(null);
  public movieLanguages: string[] = [];
  public movieDubbings: string[] = [];
  public movieSubtitles: string[] = [];
  public languagesFilter: Observable<string[]>;
  public dubbingsFilter: Observable<string[]>;
  public subtitlesFilter: Observable<string[]>;
  public selectedLanguages: string[] = [];
  public selectedDubbings: string[] = [];
  public selectedSubtitles: string[] = [];

  // Territory section
  public territoriesFilter: Observable<string[]>;
  public territoryControl = new FormControl();
  public movieTerritories: TerritoriesSlug[] = TERRITORIES_SLUG;
  public selectedTerritories: string[] = [];
  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor(
    private query: MovieQuery,
    private basketService: BasketService,
    private router: Router
  ) {}

  ngOnInit() {
    // The movie$ observable will get unsubscribed by the async pipe
    this.movie$ = this.query.selectActive().pipe(
      tap(movie => {
        this.movieLanguages = movie.main.languages;
        this.movieDubbings = movie.versionInfo.dubbings;
        this.movieSubtitles = movie.versionInfo.subtitles;
      })
    );
    this.territoriesFilter = this.territoryControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(territory => this._territoriesFilter(territory))
    );
    this.languagesFilter = this.languageControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._languageFilter(value))
    );
    this.dubbingsFilter = this.dubbingsControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._dubbingsFilter(value))
    );
    this.subtitlesFilter = this.subtitlesControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._subtitlesFilter(value))
    );
    this.formSubscription = this.form.valueChanges.subscribe(data => {
      this.catalogBasket = createBaseBasket({
        rights: [
          createDistributionRight({
            id: this.basketService.createFireStoreId,
            movieId: this.movie.id,
            medias: data.medias,
            languages: data.languages,
            dubbings: data.dubbings,
            subtitles: data.subtitles,
            duration: {
              from: data.duration.from,
              to: data.duration.to
            },
            territories: data.territories
          })
        ]
      });
      this.choosenDateRange.to = data.duration.to;
      this.choosenDateRange.from = data.duration.from;
    });
  }

  private get movie(): Movie {
    return this.query.getActive();
  }

  /////////////////////
  // Filter section //
  ////////////////////

  private _languageFilter(value: string): string[] {
    return this.movieLanguages.filter(language =>
      language.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _dubbingsFilter(value: string): string[] {
    return this.movieDubbings.filter(language =>
      language.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _subtitlesFilter(value: string): string[] {
    return this.movieSubtitles.filter(language =>
      language.toLowerCase().includes(value.toLowerCase())
    );
  }

  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return this.movieTerritories.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  ///////////////////
  // Form section //
  //////////////////

  public changeDateFocus(dates: DateRange) {
    this.opened = true;
    this.choosenDateRange.to = dates.to;
    this.choosenDateRange.from = dates.from;
  }

  public selectedTerritory(territory: MatAutocompleteSelectedEvent) {
    if (!this.selectedTerritories.includes(territory.option.viewValue)) {
      this.selectedTerritories.push(territory.option.value);
    }
    this.form.addTerritory(territory.option.viewValue as TerritoriesSlug);
    this.territoryInput.nativeElement.value = '';
  }

  public removeTerritory(territory: TerritoriesSlug, index: number) {
    const i = this.selectedTerritories.indexOf(territory);
    if (i >= 0) {
      this.selectedTerritories.splice(i, 1);
    }
    this.form.removeTerritory(index);
  }

  public setWantedRange(date: DateRange) {
    this.form.get('duration').setValue({ to: date.to, from: date.from });
    this.opened = false;
  }

  public checkMedia(media: MediasSlug) {
    this.form.checkMedia(media);
  }

  public addLanguage(language: LanguagesSlug) {
    if (!this.selectedLanguages.includes(language) && this.movieLanguages.includes(language)) {
      this.selectedLanguages.push(language);
      this.form.addLanguage(language);
    }
  }

  public removeLanguage(language: LanguagesSlug, index: number) {
    if (this.selectedLanguages.includes(language)) {
      this.selectedLanguages.splice(index, 1);
      this.form.removeLanguage(language);
    }
  }

  public addDubbing(language: LanguagesSlug) {
    if (!this.selectedDubbings.includes(language) && this.movieDubbings.includes(language)) {
      this.selectedDubbings.push(language);
      this.form.addDubbings(language);
    }
  }

  public removeDubbing(language: LanguagesSlug, index: number) {
    if (this.selectedDubbings.includes(language)) {
      this.selectedDubbings.splice(index, 1);
      this.form.removeDubbings(language);
    }
  }

  public addSubtitle(language: LanguagesSlug) {
    if (!this.selectedSubtitles.includes(language) && this.movieSubtitles.includes(language)) {
      this.selectedSubtitles.push(language);
      this.form.addSubtitles(language);
    }
  }

  public removeSubtitle(language: LanguagesSlug, index: number) {
    if (this.selectedSubtitles.includes(language)) {
      this.selectedSubtitles.splice(index, 1);
      this.form.removeSubtitles(language);
    }
  }

  public addDistributionRight() {
    this.basketService.addBasket(this.catalogBasket);
    this.router.navigateByUrl(`layout/o/catalog/selection/overview`);
  }

  //////////////////////
  // Research section //
  //////////////////////

  public startResearch() {
    /**
     * If the customer once hit the search button. We want to listen on the changes
     * he is going to make. That will give us the chance to render the hint/error message
     * in real time. But for that he needs to fill every part of the survey once.
     */
    this.researchSubscription = this.form.valueChanges
      .pipe(
        startWith(this.form.value),
        tap(value => {
          const salesAgentDateRange: boolean = salesAgentHasDateRange(
            this.movie.salesAgentDeal.rights,
            value.duration
          );
          const salesInDateRange = hasSalesRights(value.duration, this.movie.sales);
          const availableTerritories = hasTerritoriesInCommon(
            value.territories,
            this.movie.salesAgentDeal.territories,
            salesInDateRange.intersectedSales
          );
          const exclusiveSales: MovieSale[] = exclusiveMovieSales(this.movie.sales);
          const exclusiveDateRangeSales: FilteredResponse = hasExclusiveDateRangeSales(
            value.duration,
            exclusiveSales
          );
          /**
           * If salesAgentDateRange resolves as true, the sales agent doesn't provide this wanted date range
           */
          if (salesAgentDateRange) {
            this.step = this.steps.ERROR;
            console.log(
              `There are no sales agent provided in that date range. ${value.duration.from.getDate()} - ${value.duration.to.getDate()}`
            );
          } else if (
            !!availableTerritories.availableValues ||
            !!availableTerritories.intersectedSales
          ) {
            if (!exclusiveDateRangeSales.intersected) {
              console.log('YOU CAN BUY YOUR DIST RIGHT, NO INTERSECTION FOUND');
            } else {
              const exclusiveTerritoriesInCommon: FilteredResponse = hasExclusiveTerritoriesInCommon(
                value.territories,
                exclusiveDateRangeSales.intersectedExclusiveSales
              );
              if (exclusiveTerritoriesInCommon.intersected) {
                this.step = this.steps.ERROR;
                console.log(
                  'occupied by this dist right' +
                    exclusiveTerritoriesInCommon.intersectedExclusiveSales
                );
              } else if (!salesAgentDateRange) {
                /**
                 * For the choosen date range of the customer, there is a sales agent
                 * that can sell this movie
                 */
                /**
                 * We checked that there are no intersections with exclusive sales,
                 * so now we need to look for non exclusive sales that aren't the
                 * same distribution rights like the customer wants to have, or even
                 * contains all of the rights that the customer has choosen
                 */
                if (salesInDateRange.intersected && !value.exclusive) {
                  /**
                   * If there are other sales in the wanted date range, we have to look
                   * for the intersected properties
                   */
                  if (availableTerritories.intersected) {
                    /**
                     * If true, there are sales in that territory for the choosen date range
                     */
                    const availableMedias: FilteredResponse = hasMediaInCommon(
                      value.medias,
                      availableTerritories.intersectedSales,
                      this.movie.salesAgentDeal.medias
                    );
                    if (availableMedias.intersected) {
                      /**
                       * Now we need to check if every wanted value from the buyer is included in the
                       * already existing sales
                       */
                      availableMedias.intersectedSales.forEach(sale => {
                        if (
                          isEqual(sortBy(sale.medias), sortBy(value.medias)) &&
                          isEqual(sortBy(sale.territories), sortBy(value.territories))
                        ) {
                          this.step = this.steps.ERROR;
                          console.log(
                            'The are already a distribution right for your wanted values'
                          );
                        } else {
                          const territoriesIntersections: MovieSale[] = [];

                          value.territories.forEach(territory => {
                            if (includes(sale.territories, territory)) {
                              territoriesIntersections.push(sale);
                            }
                          });
                          /**
                           * Here we are checking if the territories wanted from the
                           * customer are different in one territory from the existing sales
                           */
                          if (territoriesIntersections.length >= 1) {
                            const mediasIntersections: MovieSale[] = [];

                            value.medias.forEach(media => {
                              if (includes(sale.medias, media)) {
                                mediasIntersections.push(sale);
                              }
                            });
                            if (mediasIntersections.length >= 1) {
                              for (const intersection of territoriesIntersections) {
                                if (mediasIntersections.includes(intersection)) {
                                  console.log(
                                    'already existing dist right in this territory with your wanted media' +
                                      intersection
                                  );
                                }
                              }
                            } else {
                              console.log('No INTERSECTIONS were found in the media section');
                            }
                          } else {
                            console.log('YOU CAN CREATE YOUR DIST RIGHT');
                          }
                        }
                      });
                    } else {
                      console.log('available medias was the problem' + availableMedias);
                    }
                  } else {
                    console.log('SALES AGENT DOESNT PROVIDE THESE TERRITORIES', value.territories);
                  }
                } else if (value.exclusive && salesInDateRange.intersected) {
                  /**
                   * If the customer wants to have an exclusive distribution right,
                   * we need to find the all the sales for his wanted values and
                   * give him the possibilities to rebuy other distribution rights.
                   */
                  const salesToBeBought: MovieSale[] = [];
                  for (const sale of salesInDateRange.intersectedSales) {
                    for (const territory of value.territories) {
                      for (const media of value.medias) {
                        if (
                          sale.territories.includes(territory) &&
                          sale.medias.includes(media) &&
                          !salesToBeBought.includes(sale)
                        ) {
                          salesToBeBought.push(sale);
                        }
                      }
                    }
                  }
                  if (salesToBeBought.length) {
                    console.log('You have to buy this sales', salesToBeBought);
                  }
                } else {
                  console.log(
                    'YOU CAN BUY THE RIGHT, CAUSE THERE WHERE NO OTHER DIST RIGHT FOUNDS'
                  );
                }
              } else {
                console.log('NO ELSE WAS PROVIDED');
              }
            }
          } else {
            console.log('Sales agent does not provide these territories', value.territories);
          }
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.researchSubscription.unsubscribe();
  }
}
