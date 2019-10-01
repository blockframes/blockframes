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
import { Movie, MovieQuery } from '@blockframes/movie/movie/+state';
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
  getSalesInDateRange,
  getSalesWithMediasAndTerritoriesInCommon,
  exclusiveMovieSales,
  salesAgentHasDateRange
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
  ) { }

  ngOnInit() {
    // The movie$ observable will get unsubscribed by the async pipe
    this.movie$ = this.query.selectActive().pipe(
      tap(movie => {
        this.movieLanguages = movie.main.languages;
        // @todo #980 should be all dubbings (ie langugages from static-model) since we can make a request to get new dubbings
        // But wait vincent return on that point
        this.movieDubbings = movie.versionInfo.dubbings; 
        // @todo #980 should be all dubbings (ie langugages from static-model) since we can make a request to get new dubbings
        // But wait vincent return on that point
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
    this.researchSubscription = this.form.valueChanges.pipe(startWith(this.form.value)).subscribe();
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
        tap(value => {

          //////////////////
          // FORM VALIDATION
          //////////////////

          // @todo #980 form validation, do we have territories selected, medias etc ..

          /////////////////////
          // SALES AGENT CHECKS
          /////////////////////

          // If isSpecifiedDateRangeInSalesAgentDateRange resolves as false, the sales agent doesn't provide this wanted date range
          const isSpecifiedDateRangeInSalesAgentDateRange: boolean = salesAgentHasDateRange(
            this.movie.salesAgentDeal.rights,
            value.duration
          );
          if (!isSpecifiedDateRangeInSalesAgentDateRange) {
            this.step = this.steps.ERROR;
            console.log(
              `There is no sales agent provided in that date range. ${value.duration.from.getDate()} - ${value.duration.to.getDate()}`
            );
            return false; // End of process
          }

          // Do we have territories or medias from search that are not in sales agent scope ?
          const territoriesNotInSalesAgentScope = [];
          value.territories.forEach(territory => {
            if (!this.movie.salesAgentDeal.territories.includes(territory)) {
              territoriesNotInSalesAgentScope.push(territory)
            }
          });

          const mediasNotInSalesAgentScope = [];
          value.medias.forEach(media => {
            if (!this.movie.salesAgentDeal.medias.includes(media)) {
              mediasNotInSalesAgentScope.push(media);
            }
          });

          if (mediasNotInSalesAgentScope.length || territoriesNotInSalesAgentScope.length) {
            // @todo #980 let customer make a request to sales agent ( to see if he can adapt and find a solution)
            console.log('Some territories or medias are not in sales agent scope', territoriesNotInSalesAgentScope, mediasNotInSalesAgentScope);
            return false; // End of process
          }

          ///////////////
          // SALES CHECKS
          ///////////////

          // Do we have others sales overrlapping current daterange ?
          const salesInDateRange = getSalesInDateRange(value.duration, this.movie.sales);
          if (salesInDateRange.length === 0) {
            // We have no intersection with other sales, so we are OK !
            console.log('YOU CAN BUY YOUR DIST RIGHT, NO INTERSECTION FOUND');
            return true; // End of process
          }

          // We have territories and medias in common with some existing sales,
          // Lets check if territories and medias in common belongs to the same sales and if those sales are exclusives.
          const salesWithMediasAndTerritoriesInCommon = getSalesWithMediasAndTerritoriesInCommon(
            value.territories,
            value.medias,
            salesInDateRange
          )

          if (salesWithMediasAndTerritoriesInCommon.length) {
            const exclusiveSalesWithMediasAndTerritoriesInCommon = exclusiveMovieSales(salesWithMediasAndTerritoriesInCommon);
            if (exclusiveSalesWithMediasAndTerritoriesInCommon.length) {
              console.log('There is some exclusive sales blocking your request :', exclusiveSalesWithMediasAndTerritoriesInCommon);
              return false; // End of process
            } else {
              if (value.exclusive) {
                console.log('There is some sales blocking your exclusivity request :', salesWithMediasAndTerritoriesInCommon);
                return false; // End of process
              } else {
                console.log('YOU CAN BUY YOUR DIST RIGHT, since you do not require exclusivity');
                return true; // End of process
              }
            }
          } else {
            // There is no sales with territories AND medias in common, we are OK.
            console.log('YOU CAN BUY YOUR DIST RIGHT, NO MEDIAS AND TERRITORIES OVERLAPPING FOUND');
            return true; // End of process
          }


          // @todo #980 
          // do same verification process with languages, dubbing, subtitles ?
          // Is it relevant to distinguish Languages and Dubbings ?
          // => Wait for Vincent return on this since we do not know how exclusivity must behave regarding dubbings, subtitles..

        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
    this.researchSubscription.unsubscribe();
  }
}
