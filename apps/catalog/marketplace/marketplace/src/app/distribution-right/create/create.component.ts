import {
  TerritoriesSlug,
  LanguagesLabel,
  MediasSlug,
  MEDIASSLUG,
  TERRITORIESSLUG
} from '@blockframes/movie/movie/static-model/types';
import { Router } from '@angular/router';
import { BasketService } from '../+state/basket.service';
import { CatalogBasket, createBaseBasket, createDistributionRight } from '../+state/basket.model';
import { ViewChild, HostBinding } from '@angular/core';
import { DateRange } from '@blockframes/utils';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Component, OnInit, ElementRef } from '@angular/core';
import { DistributionRightForm } from './create.form';
import { MovieQuery, Movie, staticModels } from '@blockframes/movie';
import { ChangeDetectionStrategy } from '@angular/core';
import { startWith, debounceTime } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightCreateComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'distribution-right';
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

  /*
    This variable will be input the dates inside of the datepicker
    if the users types it in manually
 */
  public choosenDateRange: DateRange = { to: new Date(), from: new Date() };
  // This variable contains the dates which the movie is already bought
  public occupiedDateRanges: DateRange[] = [];

  // Media section
  public movieMedia: MediasSlug[] = MEDIASSLUG;

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

  // Datepicker section
  public disabledDates: Date;

  // Territory section
  public territoriesFilter: Observable<string[]>;
  public territoryControl = new FormControl();
  public movieTerritories: TerritoriesSlug[] = TERRITORIESSLUG;
  public selectedTerritories: string[] = [];
  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor(
    private query: MovieQuery,
    private basketService: BasketService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.movie$ = this.query.selectActive();
    this.query.selectActive().subscribe(movie => {
      this.movieLanguages = movie.main.languages;
      this.movieDubbings = movie.versionInfo.dubbings;
      this.movieSubtitles = movie.versionInfo.subtitles;
    });
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
    this.form.valueChanges.subscribe(data => {
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

  // Research section

  public startResearch() {
    if (
      this.isInRange(
        this.form.get('duration').value,
        this.query.getActive().salesAgentDeal.rights
      ) &&
      this.hasTerritoriesInCommon(
        this.form.get('territories').value,
        this.query.getActive().salesAgentDeal.territories
      ) &&
      this.hasMediaInCommon(
        this.form.get('medias').value,
        this.query.getActive().salesAgentDeal.medias
      )
    ) {
      // can't create distribution right
      this.showResults = false;
      this.snackBar.open('There is no availability matching your research', null, {
        duration: 5000
      });
    } else {
      // create distribution right
      this.showResults = true;
      this.choosenDateRange.to = this.form.get('duration').value.to;
      this.choosenDateRange.from = this.form.get('duration').value.from;
    }
  }

  /**
   * We want to check if selected range is overlapping with salesAgent daterange
   * @returns true if in salesAgent daterange
   * @param formDates
   * @param salesAgentDates
   */
  private isInRange(formDates: DateRange, salesAgentDates: DateRange): boolean {
    const salesAgentDateFrom: Date = new Date(salesAgentDates.from);
    const salesAgentDateTo: Date = new Date(salesAgentDates.to);

    // If 'from' date is between sales agent date 'from' and 'to', it is in range
    if (
      formDates.from.getTime() >= salesAgentDateFrom.getTime() &&
      formDates.from.getTime() <= salesAgentDateTo.getTime()
    ) {
      return true;
    }

    // If 'to' date is older than sales agent 'to' date
    // and 'to' date is younger than sales agent 'from' date, it is in range
    if (
      formDates.to.getTime() <= salesAgentDateTo.getTime() &&
      formDates.to.getTime() >= salesAgentDateFrom.getTime()
    ) {
      return true;
    }

    // If 'from' date is older than sales agent 'from' date and
    // 'to' date if younger than sales agent 'to' date and
    if (
      formDates.from.getTime() <= salesAgentDateFrom.getTime() &&
      formDates.to.getTime() >= salesAgentDateTo.getTime()
    ) {
      return true;
    }

    // Not in range
    return false;
  }

  /**
   * We want to check if formTerritories and salesAgentTerritories have territories in common
   * @param formTerritories
   * @param salesAgentTerritories
   */
  private hasTerritoriesInCommon(
    formTerritories: string[],
    salesAgentTerritories: string[]
  ): boolean {
    const checkedTerritories: string[] = [];
    formTerritories.forEach(territoriy => {
      if (salesAgentTerritories.includes(territoriy)) {
        checkedTerritories.push(territoriy);
      }
    });
    return checkedTerritories.length > 0;
  }

  /**
   * We want to check if formMedias and salesAgentMedias have medias in common
   * @param formMedias
   * @param salesAgentMedias
   */
  private hasMediaInCommon(formMedias: string[], salesAgentMedias: string[]): boolean {
    const checkedMedia: string[] = [];
    formMedias.forEach(media => {
      if (salesAgentMedias.includes(media)) {
        checkedMedia.push(media);
      }
    });
    return checkedMedia.length > 0;
  }
}
