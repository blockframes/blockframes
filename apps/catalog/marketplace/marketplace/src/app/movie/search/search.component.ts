// Angular
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ElementRef,
  ViewChild,
  HostBinding
} from '@angular/core';
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
import { languageValidator, StandardErrorStateMatcher } from '@blockframes/utils';
// RxJs
import { Observable, combineLatest } from 'rxjs';
import { startWith, map, debounceTime, switchMap } from 'rxjs/operators';
// Others
import { CatalogSearchForm } from './search.form';
import { filterMovie } from './filter.util';

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

  /* Observables on the languages selected */
  public languages$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.value),
    map(({ languages }) => Object.keys(languages))
  );

  /* Array of sorting options */
  public sortOptions: string[] = ['All films', 'Title', 'Director', 'Production Year'];
  public availableLimits: number[] = [18, 36, 54, 72];

  /* Flag to indicate either the movies should be presented as a card or a list */
  public listView: boolean;

  /* Data for UI */
  public movieGenres: GenresLabel[] = GENRES_LABEL;
  public movieLanguages: LanguagesLabel[] = LANGUAGES_LABEL;
  public movieTerritories: TerritoriesLabel[] = TERRITORIES_LABEL;
  public movieCertifications: CertificationsLabel[] = CERTIFICATIONS_LABEL;
  public movieMedias: MediasLabel[] = MEDIAS_LABEL;

  /* Filter for autocompletion */
  public territoriesFilter: Observable<string[]>;
  public languagesFilter: Observable<string[]>;

  /* Individual form controls for filtering */
  public languageControl: FormControl = new FormControl('', [
    Validators.required,
    languageValidator
  ]);
  public territoryControl: FormControl = new FormControl();
  public sortByControl: FormControl = new FormControl('');

  /* Arrays for showing the selected entities in the UI */
  public selectedMovieTerritories: string[] = [];

  /* Flags for the chip input */
  public visible = true;
  public selectable = true;
  public removable = true;

  /* Number of available movies in the database */
  public availableMovies: number;

  public matcher = new StandardErrorStateMatcher();

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;
  @ViewChild(MatAccordion, { static: false }) accordion: MatAccordion;

  constructor(private movieQuery: MovieQuery, private router: Router) {}

  ngOnInit() {
    this.movieSearchResults$ = combineLatest([
      this.sortByControl.valueChanges.pipe(
        startWith('All films'),
        switchMap(sortIdentifier =>
          this.movieQuery.selectAll({
            sortBy: (a, b) => {
              switch (sortIdentifier) {
                case 'Title':
                  return a.main.title.original.localeCompare(b.main.title.original);
                case 'Director':
                  return a.main.directors[0].lastName.localeCompare(b.main.directors[0].lastName);
                case 'Production Year':
                  if (b.main.productionYear < a.main.productionYear) {
                    return -1;
                  }
                  if (b.main.productionYear > a.main.productionYear) {
                    return 1;
                  }
                  return 0;
              }
            }
          })
        )
      ),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value))
    ]).pipe(
      map(([movies, filterOptions]) => movies.filter(movie => filterMovie(movie, filterOptions)))
    );

    this.movieSearchResults$.subscribe(movies => (this.availableMovies = movies.length));

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
  }

  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`layout/o/catalog/${id}`);
  }

  ////////////////////
  // Filter section //
  ////////////////////

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
