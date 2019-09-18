// Angular
import { Router } from '@angular/router';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { ErrorStateMatcher, MatAccordion } from '@angular/material';
import { Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit, ElementRef, ViewChild, HostBinding } from '@angular/core';
// Blockframes
import { Movie, MovieQuery } from '@blockframes/movie';
import {
  GenresLabel,
  GENRES_LABEL,
  LANGUAGES_LABEL,
  LanguagesLabel,
  CertificationsLabel,
  MediasLabel,
  TerritoriesLabel,
  CERTIFICATIONS_LABEL,
  MEDIAS_LABEL,
  TERRITORIES_LABEL
} from '@blockframes/movie/movie/static-model/types';
// RxJs
import { Observable, combineLatest } from 'rxjs';
import { startWith, map, debounceTime, tap } from 'rxjs/operators';
// Others
import { CatalogSearchForm } from './search.form';
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
  @HostBinding('attr.page-id') pageId = 'catalog-search';
  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  /* Instance of the search form */
  public filterForm = new CatalogSearchForm();

  /* Array of sorting options */
  public sortOptions: string[] = ['All films', 'Title', 'Director', 'Production Year'];

  /* Flag to indicate either the movies should be presented as a card or a list */
  public listView: boolean;

  /* Array to hold the movies sorted by parameters */
  public sortedMovies: Movie[];

  // TODO#748: split up into compoennts
  public movieGenres: GenresLabel[];
  public movieLanguages: LanguagesLabel[];
  public languageControl = new FormControl('', [Validators.required, languageValidator]);
  public languagesFilter: Observable<string[]>;
  public movieCertifications: CertificationsLabel[];
  public movieMedias: MediasLabel[];
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
  public movieTerritories: TerritoriesLabel[];
  public territoryControl: FormControl = new FormControl();

  constructor(private movieQuery: MovieQuery, private router: Router) {}

  ngOnInit() {
    this.movieGenres = GENRES_LABEL;
    this.movieLanguages = LANGUAGES_LABEL;
    this.movieCertifications = CERTIFICATIONS_LABEL;
    this.movieMedias = MEDIAS_LABEL;
    this.movieTerritories = TERRITORIES_LABEL;
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
      this.movieQuery.selectAll(),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([movies, filterOptions]) => movies.filter(movie => filterMovie(movie, filterOptions)))
    );
    this.sortBy();
  }

  public goToDetails(id: string) {
    this.router.navigateByUrl(`layout/o/catalog/${id}`);
  }

  ////////////////////
  // Filter section //
  ////////////////////

  // TODO#952
  public sortBy(option?: string) {
    switch (option) {
      case 'Director':
        this.movieSearchResults$
          .pipe(
            tap(movies => {
              this.sortedMovies = movies.sort((a: Movie, b: Movie) => {
                return b.main.directors[0].lastName.localeCompare(a.main.directors[0].lastName);
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
                (this.sortedMovies = movies.sort((a: Movie, b: Movie) => {
                  return a.main.title.original.localeCompare(b.main.title.original);
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
                (this.sortedMovies = movies.sort((a: Movie, b: Movie) => {
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
        this.movieSearchResults$.subscribe(movies => (this.sortedMovies = movies));
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

  public addLanguage(language: LanguagesLabel) {
    if (this.movieLanguages.includes(language)) {
      this.filterForm.addLanguage(language);
    }
  }

  public removeLanguage(language: LanguagesLabel) {
    this.filterForm.removeLanguage(language);
  }

  public deleteLanguage(language: LanguagesLabel) {
    this.filterForm.removeLanguage(language);
  }

  public hasGenre(genre: GenresLabel) {
    if (this.movieGenres.includes(genre) && !this.filterForm.get('type').value.includes(genre)) {
      this.filterForm.addType(genre);
    } else {
      this.filterForm.removeType(genre);
    }
  }

  public checkCertification(certification: CertificationsLabel) {
    if (this.movieCertifications.includes(certification)) {
      this.filterForm.checkCertification(certification);
    }
  }

  public checkMedia(media: MediasLabel) {
    if (this.movieMedias.includes(media)) {
      this.filterForm.checkMedia(media);
    }
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
    this.filterForm.addTerritory(territory.option.viewValue as TerritoriesLabel);
    this.territoryInput.nativeElement.value = '';
  }
}
