import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { ErrorStateMatcher, MatAccordion } from '@angular/material';
import { Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { Movie, staticModels } from '@blockframes/movie';
import { FireQuery } from '@blockframes/utils';
import { startWith, map, debounceTime } from 'rxjs/operators';
import {
  MovieType,
  CatalogSearchForm,
  Language,
  Certifications,
  MovieMedias,
  MovieTerritories
} from './marketplace-search.form';
import { languageValidator } from './marketplace-search-validators.form';
import { filterMovie } from './filter.util';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'catalog-marketplace-search',
  templateUrl: './marketplace-search.component.html',
  styleUrls: ['./marketplace-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class MarketplaceSearchComponent implements OnInit {
  public movieSearchResults$: Observable<Movie[]>;
  public filterForm = new CatalogSearchForm();
  // TODO#748: split up into compoennts
  public movieGenres: MovieType[];
  public movieLanguages: Language[];
  public languageControl = new FormControl('', [Validators.required, languageValidator]);
  public languagesFilter: Observable<string[]>;
  public movieCertifications: Certifications[];
  public movieMedias: MovieMedias[];
  public movies$: Observable<Movie[]> = this.fireQuery.collection<Movie>('movies').valueChanges();
  // Observables on the languages selected
  public languages$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.value),
    map(({ languages }) => Object.keys(languages))
  );
  public matcher = new MyErrorStateMatcher();

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild(MatAccordion, { static: false }) accordion: MatAccordion;

  /** Section for chip input */
  public visible = true;
  public selectable = true;
  public removable = true;
  public selectedMovieTerritories: string[] = [];
  public territoriesFilter: Observable<string[]>;
  public movieTerritories: MovieTerritories[];
  public territoryControl: FormControl = new FormControl();

  constructor(private fireQuery: FireQuery) {}

  ngOnInit() {
    this.movieGenres = staticModels['GENRES'].map(key => key.label);
    this.movieLanguages = staticModels['LANGUAGES'].map(key => key.label);
    this.movieCertifications = staticModels['CERTIFICATIONS'].map(key => key.label);
    this.movieMedias = staticModels['MEDIAS'].map(key => key.label);
    this.movieTerritories = staticModels['TERRITORIES'].map(key => key.label);
    this.languagesFilter = this.languageControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._languageFilter(value))
    );
    this.territoriesFilter = this.territoryControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(territory => this._territoriesFilter(territory))
    );
    this.movieSearchResults$ = combineLatest([this.movies$, this.filterForm.valueChanges]).pipe(
      map(([movies, filterOptions]) => {
        return movies.filter(movie => filterMovie(movie, filterOptions));
      })
    );
    this.movies$.subscribe(data => console.log(data))
  }

  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return this.movieTerritories.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  private _languageFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.movieLanguages.filter(language => language.toLowerCase().includes(filterValue));
  }

  public addLanguage(language: string) {
    if (this.movieLanguages.includes(language)) {
      this.filterForm.addLanguage(language);
    }
  }

  public removeLanguage(language: string) {
    this.filterForm.removeLanguage(language);
  }

  public hasGenre(genre: MovieType) {
    if (this.movieGenres.includes(genre) && !this.filterForm.get('type').value.includes(genre)) {
      this.filterForm.addType(genre);
    } else {
      this.filterForm.removeType(genre);
    }
  }

  public checkCertification(certification: string) {
    if (this.movieCertifications.includes(certification)) {
      this.filterForm.checkCertification(certification);
    }
  }

  public checkMedia(media: string) {
    if (this.movieMedias.includes(media)) {
      this.filterForm.checkMedia(media);
    }
  }

  public deleteLanguage(language: string) {
    this.filterForm.removeLanguage(language);
  }

  public removeTerritory(territory: string, index: number) {
    const i = this.selectedMovieTerritories.indexOf(territory);

    if (i >= 0) {
      this.selectedMovieTerritories.splice(i, 1);
    }
    this.filterForm.removeTerritory(index);
  }

  public selectedTerritory(territory: MatAutocompleteSelectedEvent) {
    if (!this.selectedMovieTerritories.includes(territory.option.viewValue)) {
      this.selectedMovieTerritories.push(territory.option.value);
    }
    this.filterForm.addTerritory(territory.option.viewValue);
    this.territoryInput.nativeElement.value = '';
  }

  public applyFilters() {
    this.movieSearchResults$ = combineLatest([this.movies$, this.filterForm.valueChanges]).pipe(
      map(([movies, filterOptions]) => {
        return movies.filter(movie => filterMovie(movie, filterOptions));
      }),
    );
  }
}
