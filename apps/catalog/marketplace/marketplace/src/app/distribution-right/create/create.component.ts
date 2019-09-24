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
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Movie, MovieQuery, MovieSale } from '@blockframes/movie/movie/+state';
import {
  LanguagesLabel,
  MEDIAS_SLUG,
  MediasSlug,
  TERRITORIES_SLUG,
  TerritoriesSlug
} from '@blockframes/movie/movie/static-model/types';
import { DateRange } from '@blockframes/utils';
import { CatalogBasket, createBaseBasket, createDistributionRight } from '../+state/basket.model';
import { BasketService } from '../+state/basket.service';
import {
  hasSalesRights,
  hasTerritoriesInCommon,
  movieHasExclusiveSales,
  hasMediaInCommon
} from './availabilities.util';
import { DistributionRightForm } from './create.form';

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightCreateComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'distribution-right';

  // Subscription for value changes int he distribution right form
  private formSubscription: Subscription;

  // Form for holding users distribution rights choice
  public form = new DistributionRightForm();

  // Movie for information to display
  public movie$: Observable<Movie>;

  // This variable is going to be passed down to the catalog-form-selection table component
  public catalogBasket: CatalogBasket;

  // A flag to indicate if datepicker is open
  public opened = false;

  // A flag to indicate if results should be shown
  public showResults = false;

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
    private router: Router,
    private snackBar: MatSnackBar
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
            movieId: this.query.getActive().id,
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

  public removeTerritory(territory: string, index: number) {
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

  public checkMedia(media: string) {
    this.form.checkMedia(media);
  }

  public addLanguage(language: LanguagesLabel) {
    if (!this.selectedLanguages.includes(language) && this.movieLanguages.includes(language)) {
      this.selectedLanguages.push(language);
      this.form.addLanguage(language);
    }
  }

  public removeLanguage(language: LanguagesLabel, index: number) {
    if (this.selectedLanguages.includes(language)) {
      this.selectedLanguages.splice(index, 1);
      this.form.removeLanguage(language);
    }
  }

  public addDubbing(language: LanguagesLabel) {
    if (!this.selectedDubbings.includes(language) && this.movieDubbings.includes(language)) {
      this.selectedDubbings.push(language);
      this.form.addDubbings(language);
    }
  }

  public removeDubbing(language: LanguagesLabel, index: number) {
    if (this.selectedDubbings.includes(language)) {
      this.selectedDubbings.splice(index, 1);
      this.form.removeDubbings(language);
    }
  }

  public addSubtitle(language: LanguagesLabel) {
    if (!this.selectedSubtitles.includes(language) && this.movieSubtitles.includes(language)) {
      this.selectedSubtitles.push(language);
      this.form.addSubtitles(language);
    }
  }

  public removeSubtitle(language: LanguagesLabel, index: number) {
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
    const exclusiveSales: MovieSale[] = movieHasExclusiveSales(this.query.getActive().sales);
    const salesDateRange: MovieSale[] | boolean = hasSalesRights(
      this.query.getActive().sales,
      this.form.get('duration').value,
      this.query.getActive().salesAgentDeal
    );
    const availableTerritories: string[] = hasTerritoriesInCommon(
      this.form.get('territories').value,
      this.query.getActive().salesAgentDeal.territories
    );
    const availableMedias: string[] = hasMediaInCommon(
      this.form.get('medias').value,
      this.query.getActive().salesAgentDeal.medias
    );
    if (!!exclusiveSales && !!salesDateRange && !!availableTerritories && !!availableMedias) {
      // create distribution right
      this.showResults = true;
      this.choosenDateRange.to = this.form.get('duration').value.to;
      this.choosenDateRange.from = this.form.get('duration').value.from;
    } else {
      // can't create distribution right
      this.showResults = false;
      this.snackBar.open('There is no availability matching your research', null, {
        duration: 5000
      });
    }
    console.log(exclusiveSales, salesDateRange, availableTerritories, availableMedias);
  }

  ngOnDestroy(): void {
    this.formSubscription.unsubscribe();
  }
}
