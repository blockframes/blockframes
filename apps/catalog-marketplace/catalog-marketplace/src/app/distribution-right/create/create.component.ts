import { Language } from './../../movie/search/search.form';
import { BasketService } from './../+state/basket.service';
import {
  CatalogBasket,
  createBasket,
  createMovieDetails,
  MovieData
} from './../+state/basket.model';
import { ViewChild } from '@angular/core';
import { DateRange } from '@blockframes/utils';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { map } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { Component, OnInit, ElementRef } from '@angular/core';
import { DistributionRightForm } from './create.form';
import { MovieQuery, Movie } from '@blockframes/movie';
import { ChangeDetectionStrategy } from '@angular/core';
import { startWith, debounceTime } from 'rxjs/operators';
import uuid from 'uuid/v4';
import { MovieTerritories } from '../../movie/search/search.form';

@Component({
  selector: 'distribution-right-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightCreateComponent implements OnInit {
  public form = new DistributionRightForm();
  public movie$: Observable<Movie>;
  // This variable is going to be passed down to the catalog-form-selection table component
  public catalogBasket: CatalogBasket;
  // This variable is going to be injected in catalog-form-selection and gets updated by the form
  public movieDetails: MovieData[];
  // A flag to indicate if datepicker is open
  public opened = false;
  /*  
    This variable will be input the dates inside of the datepicker 
    if the users types it in manually
 */
  public choosenDateRange: DateRange = { to: new Date(), from: new Date() };
  /* This variable contains the dates which the movie is already bought */
  public occupiedDateRanges: DateRange[] = [];

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
  public availableTerritories: string[] = [];
  public selectedTerritories: string[] = [];
  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor(private query: MovieQuery, private basketService: BasketService) {}

  ngOnInit() {
    this.movie$ = this.query.selectActive();
    this.query.selectActive().subscribe(movie => {
      this.availableTerritories = movie.salesAgentDeal.territories;
      this.movieLanguages = movie.main.languages;
      this.movieDubbings = movie.versionInfo.dubbings;
      this.movieSubtitles = movie.versionInfo.subtitles;
      this.disabledDates = movie.salesAgentDeal.rightsEnd;
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
      this.catalogBasket = createBasket({
        rights: [
          {
            id: uuid(),
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
          }
        ]
      });
      this.movieDetails = createMovieDetails({
        id: this.query.getActive().id,
        movieName: this.query.getActive().main.title.original,
        // We only want to display the first value
        territory: data.territories[0],
        rights: data.medias[0],
        endRights: data.duration.to.toDateString(),
        languages: data.languages[0],
        dubbed: data.dubbings[0],
        subtitle: data.subtitles[0]
      });
      this.choosenDateRange.to = data.duration.to;
      this.choosenDateRange.from = data.duration.from;
    });
    this.occupiedDateRanges.push({
      to: (this.query.getActive().salesAgentDeal.rightsEnd as any).to.toDate(),
      from: (this.query.getActive().salesAgentDeal.rightsEnd as any).from.toDate()
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
    return this.availableTerritories.filter(movieTerritory => {
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
    this.form.addTerritory(territory.option.viewValue as MovieTerritories);
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

  public addLanguage(language: Language) {
    if (!this.selectedLanguages.includes(language) && this.movieLanguages.includes(language)) {
      this.selectedLanguages.push(language);
      this.form.addLanguage(language);
    }
  }

  public removeLanguage(language: Language, index: number) {
    if (this.selectedLanguages.includes(language)) {
      this.selectedLanguages.splice(index, 1);
      this.form.removeLanguage(language);
    }
  }

  public addDubbing(language: Language) {
    if (!this.selectedDubbings.includes(language) && this.movieDubbings.includes(language)) {
      this.selectedDubbings.push(language);
      this.form.addDubbings(language);
    }
  }

  public removeDubbing(language: Language, index: number) {
    if (this.selectedDubbings.includes(language)) {
      this.selectedDubbings.splice(index, 1);
      this.form.removeDubbings(language);
    }
  }

  public addSubtitle(language: Language) {
    if (!this.selectedSubtitles.includes(language) && this.movieSubtitles.includes(language)) {
      this.selectedSubtitles.push(language);
      this.form.addSubtitles(language);
    }
  }

  public removeSubtitle(language: Language, index: number) {
    if (this.selectedSubtitles.includes(language)) {
      this.selectedSubtitles.splice(index, 1);
      this.form.removeSubtitles(language);
    }
  }

  public addDistributionRight() {
    const findDistribution = this.catalogBasket.rights.findIndex(
      index => index.movieId === this.query.getActive().id
    );
    if (findDistribution === -1) {
      throw new Error('Distribution rights not found');
    } else {
      this.basketService.add(this.catalogBasket);
    }
  }

  public resetMovieDistribution() {
    this.movieDetails = createMovieDetails({
      id: this.query.getActive().id,
      movieName: this.query.getActive().main.title.original
    });
  }
}
