// Angular
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { ErrorStateMatcher, MatAccordion } from '@angular/material';
import { Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild } from '@angular/core';
// Blockframes
import { Movie, staticModels } from '@blockframes/movie';
import { MovieQuery } from '@blockframes/movie';
// RxJs
import { Observable, combineLatest } from 'rxjs';
import { startWith, map, debounceTime, tap } from 'rxjs/operators';
// Others
import {
  CatalogSearchForm,
  Languages,
  Certifications,
  MovieMedias,
  MovieTerritories,
  MovieGenres
} from './search.form';
import { languageValidator } from './search-validators.form';
import { filterMovie } from './filter.util';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'catalog-movie-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit {
  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  /* Instance of the search form */
  public filterForm = new CatalogSearchForm();

  /* Array of sorting options */
  public sortOptions: string[] = ['All films', 'Title', 'Director', 'Production Year'];

  /* Flag to indicate either the movies should be presented as a card or a list */
  public listView: boolean;

  /* Array to hold the movies sorted by parameters */
  public sortByOptionMovies: Movie[];

  // TODO#748: split up into compoennts
  public movieGenres: MovieGenres[];
  public movieLanguages: Languages[];
  public languageControl = new FormControl('', [Validators.required, languageValidator]);
  public languagesFilter: Observable<string[]>;
  public movieCertifications: Certifications[];
  public movieMedias: MovieMedias[];
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

  constructor(private movieQuery: MovieQuery) {}

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
    this.movieSearchResults$ = combineLatest([
      this.movieQuery.selectAll({}),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([movies, filterOptions]) => movies.filter(movie => filterMovie(movie, filterOptions)))
    );
    this.sortBy();
  }

  ////////////////////
  // Filter section //
  ////////////////////

  public sortBy(option?: string) {
    switch (option) {
      case 'Director':
        this.movieSearchResults$
          .pipe(
            tap(movies => {
              this.sortByOptionMovies = movies.sort((a: Movie, b: Movie) => {
                if (b.main.directors[0].lastName < a.main.directors[0].lastName) {
                  return -1;
                }
                if (b.main.directors[0].lastName > a.main.directors[0].lastName) {
                  return 1;
                }
                return 0;
              });
            })
          )
          .subscribe();
        break;
      case 'Title':
        this.movieSearchResults$
          .pipe(
            tap(
              movies =>
                (this.sortByOptionMovies = movies.sort((a: Movie, b: Movie) => {
                  if (a.main.title.original < b.main.title.original) {
                    return -1;
                  }
                  if (a.main.title.original > b.main.title.original) {
                    return 1;
                  }
                  return 0;
                }))
            )
          )
          .subscribe();
        break;
      case 'Production Year':
        this.movieSearchResults$
          .pipe(
            tap(
              movies =>
                (this.sortByOptionMovies = movies.sort((a: Movie, b: Movie) => {
                  if (b.main.productionYear < a.main.productionYear) {
                    return -1;
                  }
                  if (b.main.productionYear > a.main.productionYear) {
                    return 1;
                  }
                  return 0;
                }))
            )
          )
          .subscribe();
        break;
      default:
        this.movieSearchResults$.subscribe(movies => (this.sortByOptionMovies = movies));
    }
  }

  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return this.movieTerritories.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  private _languageFilter(value: string): string[] {
    return this.movieLanguages.filter(language =>
      language.toLowerCase().includes(value.toLowerCase())
    );
  }

  //////////////////
  // Form section //
  //////////////////

  public addLanguage(language: Languages) {
    if (this.movieLanguages.includes(language)) {
      this.filterForm.addLanguage(language);
    }
  }

  public removeLanguage(language: Languages) {
    this.filterForm.removeLanguage(language);
  }

  public hasGenre(genre: MovieGenres) {
    if (this.movieGenres.includes(genre) && !this.filterForm.get('type').value.includes(genre)) {
      this.filterForm.addType(genre);
    } else {
      this.filterForm.removeType(genre);
    }
  }

  public checkCertification(certification: Certifications) {
    if (this.movieCertifications.includes(certification)) {
      this.filterForm.checkCertification(certification);
    }
  }

  public checkMedia(media: MovieMedias) {
    if (this.movieMedias.includes(media)) {
      this.filterForm.checkMedia(media);
    }
  }

  public deleteLanguage(language: Languages) {
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
    this.filterForm.addTerritory(territory.option.viewValue as MovieTerritories);
    this.territoryInput.nativeElement.value = '';
  }
}
