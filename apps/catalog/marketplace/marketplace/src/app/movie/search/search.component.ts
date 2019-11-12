// Angular
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ElementRef,
  ViewChild,
  HostBinding,
  OnDestroy
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
// Blockframes
import { Movie, MovieQuery, MovieService } from '@blockframes/movie';
import {
  GenresLabel,
  GENRES_LABEL,
  LANGUAGES_LABEL,
  LanguagesLabel,
  CertificationsLabel,
  MediasLabel,
  CERTIFICATIONS_LABEL,
  MEDIAS_LABEL,
  TERRITORIES_LABEL,
  GenresSlug,
  CertificationsSlug,
  LanguagesSlug,
  MediasSlug,
  TerritoriesSlug,
  MovieStatusLabel,
  MOVIE_STATUS_LABEL
} from '@blockframes/movie/movie/static-model/types';
import { getCodeIfExists } from '@blockframes/movie/movie/static-model/staticModels';
import { languageValidator, ControlErrorStateMatcher, sortMovieBy } from '@blockframes/utils';
// RxJs
import { Observable, combineLatest, Subscription } from 'rxjs';
import { startWith, map, debounceTime, switchMap, tap } from 'rxjs/operators';
// Others
import { CatalogSearchForm } from './search.form';
import { filterMovie } from './filter.util';
import { AFM_DISABLE } from '@env';
import { BasketService } from '../../distribution-right/+state/basket.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import flatten from 'lodash/flatten';

@Component({
  selector: 'catalog-movie-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit, OnDestroy {
  @HostBinding('attr.page-id') pageId = 'catalog-search';

  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  /* Instance of the search form */
  public filterForm = new CatalogSearchForm();

  /* Variables for searchbar autocompletion */
  public allDirectors: string[] = [];
  public allTitles: string[];
  public allKeywords: string[];

  /* Observables on the languages selected */
  public languages$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.value),
    map(({ languages }) => Object.keys(languages))
  );

  /* Array of sorting options */
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  /* Flag to indicate either the movies should be presented as a card or a list */
  public listView: boolean;

  /* Array of searchbar options */
  public searchbarOptions: string[] = ['director', 'title', 'keywords'];

  /* Data for UI */
  public movieGenres: GenresLabel[] = GENRES_LABEL;
  public movieProductionStatuses: MovieStatusLabel[] = MOVIE_STATUS_LABEL;
  public movieCertifications: CertificationsLabel[] = CERTIFICATIONS_LABEL;
  public movieMedias: MediasLabel[] = MEDIAS_LABEL;

  /* Filter for autocompletion */
  public genresFilter$: Observable<string[]>;
  public territoriesFilter$: Observable<string[]>;
  public languagesFilter$: Observable<string[]>;
  public salesAgentFilter$: Observable<string[]>;
  public resultFilter$: Observable<any[]>;

  /* Individual form controls for filtering */
  public genreControl: FormControl = new FormControl('');
  public languageControl: FormControl = new FormControl('', [
    Validators.required,
    languageValidator
  ]);
  public territoryControl: FormControl = new FormControl('');
  public salesAgentControl: FormControl = new FormControl('');
  public sortByControl: FormControl = new FormControl('');
  public searchbarTextControl: FormControl = new FormControl('');

  /* Observable to combine for the UI */
  private sortBy$ = this.sortByControl.valueChanges.pipe(
    startWith('All films'),
    switchMap(sortIdentifier =>
      this.movieQuery.selectAll({ sortBy: (a, b) => sortMovieBy(a, b, sortIdentifier) })
    )
  );
  private filterBy$ = this.filterForm.valueChanges.pipe(startWith(this.filterForm.value));

  /* Arrays for showing the selected entities in the UI */
  public selectedMovieTerritories: string[] = [];

  /* Flags for Sales Agents chip input*/
  public selectedSalesAgents: string[] = [];
  public salesAgents: string[] = [];
  private salesAgentsSub: Subscription;

  @ViewChild('salesAgentInput', { static: false }) salesAgentInput: ElementRef<HTMLInputElement>;
  @ViewChild('salesAgent', { static: false }) salesAgentMatAutocomplete: MatAutocomplete;

  /* Flags for the Territories chip input */
  public visible = true;
  public selectable = true;
  public removable = true;

  /* Number of available movies in the database */
  public availableMovies: number;

  public selectedGenres: string[] = [];
  @ViewChild('genreInput', { static: false }) genreInput: ElementRef<HTMLInputElement>;
  @ViewChild('genre', { static: false }) genreMatAutocomplete: MatAutocomplete;

  public matcher = new ControlErrorStateMatcher();

  public isMobile: boolean = this.breakpointObserver.isMatched('(max-width: 599px)');

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor(
    private movieQuery: MovieQuery,
    private router: Router,
    private movieService: MovieService,
    private basketService: BasketService,
    private snackbar: MatSnackBar,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.movieSearchResults$ = combineLatest([this.sortBy$, this.filterBy$]).pipe(
      map(([movies, filterOptions]) => {
        if (AFM_DISABLE) {
          //TODO #1146
          return movies.filter(async movie => {
            const deals = await this.movieService.getDistributionDeals(movie.id);
            return filterMovie(movie, filterOptions, deals);
          });
        } else {
          //TODO #1146 : remove the two line for movieGenres
          const removeGenre = ['TV Show', 'Web Series'];
          this.movieGenres = this.movieGenres.filter(value => !removeGenre.includes(value));
          return movies.filter(movie => {
            return filterMovie(movie, filterOptions);
          });
        }
      }),
      tap(movies => {
        this.availableMovies = movies.length;
        this.allTitles = movies.map(movie => movie.main.title.international);
        this.allKeywords = flatten(movies.map(movie => movie.promotionalDescription.keywords));
        movies.forEach(movie => {
          /*
           * If a director worked on several movies, we don't want to show
           * him in the autocompletion twice or more. Same for the other values
           */
          movie.main.directors.forEach(director => {
            /**
             * We need to combine these two properties otherwise we won't be able
             * to show it in the mat autocompletion. For instance we want to show
             * the directors name in the searchbar and this is only possible with a string value.
             */
            if (!this.allDirectors.includes(`${director.firstName} ${director.lastName}`)) {
              this.allDirectors.push(`${director.firstName} ${director.lastName}`);
            }
          });
          movie.promotionalDescription.keywords.forEach(word => {
            if (!this.allKeywords.includes(word)) {
              this.allKeywords.push(word);
            }
          });
        });
      })
    );

    this.salesAgentsSub = this.movieQuery
      .selectAll()
      .pipe(
        tap(movies => {
          movies.forEach(movie => {
            if (
              !!movie.salesAgentDeal.salesAgent &&
              !!movie.salesAgentDeal.salesAgent.displayName &&
              !this.salesAgents.includes(movie.salesAgentDeal.salesAgent.displayName)
            )
              this.salesAgents.push(movie.salesAgentDeal.salesAgent.displayName);
          });
        })
      )
      .subscribe();

    this.genresFilter$ = this.genreControl.valueChanges.pipe(
      startWith(''),
      map(genre => (genre ? this._genreFilter(genre) : this.movieGenres))
    );

    this.languagesFilter$ = this.languageControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._languageFilter(value))
    );

    this.territoriesFilter$ = this.territoryControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(territory => this._territoriesFilter(territory))
    );

    this.salesAgentFilter$ = this.salesAgentControl.valueChanges.pipe(
      startWith(''),
      map(salesAgent => (salesAgent ? this._salesAgentsFilter(salesAgent) : this.salesAgents))
    );
    this.resultFilter$ = this.searchbarTextControl.valueChanges.pipe(
      startWith(''),
      tap(value => this.searchbarForm.get('text').setValue(value)),
      map(value => this._resultFilter(value))
    );
  }

  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`layout/o/catalog/${id}`);
  }

  public get getCurrentYear(): number {
    return new Date().getFullYear();
  }

  public get searchbarForm(): FormGroup {
    return this.filterForm.get('searchbar');
  }

  /**
   * @description function for determine if FormGroup error should be shown.
   * We want to show this error only, if the children controls don't have any error.
   * @param formGroupName name of the form group which determine the logic.
   */
  public showFormGroupError(formGroupName: string): boolean {
    if (formGroupName === 'productionYear') {
      return (
        !this.filterForm
          .get('productionYear')
          .get('from')
          .hasError('pattern') &&
        !this.filterForm
          .get('productionYear')
          .get('from')
          .hasError('max') &&
        (!this.filterForm
          .get('productionYear')
          .get('to')
          .hasError('pattern') &&
          this.filterForm.get('productionYear').hasError('invalidRange'))
      );
    } else {
      return (
        !this.filterForm
          .get('availabilities')
          .get('from')
          .hasError('min') && this.filterForm.get('availabilities').hasError('invalidRange')
      );
    }
  }

  ////////////////////
  // Filter section //
  ////////////////////

  /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _genreFilter(genre: string): string[] {
    const filterValue = genre.toLowerCase();
    return GENRES_LABEL.filter(movieGenre => {
      return movieGenre.toLowerCase().includes(filterValue);
    });
  }

  /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return TERRITORIES_LABEL.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _languageFilter(value: string): string[] {
    return LANGUAGES_LABEL.filter(language => language.toLowerCase().includes(value.toLowerCase()));
  }

  /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _salesAgentsFilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.salesAgents.filter(
      salesAgent => salesAgent.toLowerCase().indexOf(filterValue) === 0
    );
  }

  /**
   * @description returns an array of strings for the autocompletion component.
   * Also we need to distinguish on what type the user want to have his results
   * @param value string which got typed in into an input field
   */
  private _resultFilter(value: string): string[] {
    if (this.searchbarForm.get('type').value === 'title') {
      return this.allTitles.filter(title => title.toLowerCase().includes(value.toLowerCase()));
    } else if (this.searchbarForm.get('type').value === 'keywords') {
      return this.allKeywords.filter(word => word.toLowerCase().includes(value.toLowerCase()));
    } else if (this.searchbarForm.get('type').value === 'director') {
      return this.allDirectors.filter(director => {
        return director.toLowerCase().includes(value.toLowerCase());
      });
    }
  }

  //////////////////
  // Form section //
  //////////////////

  public addLanguage(language: LanguagesLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const languageSlug: LanguagesSlug = getCodeIfExists('LANGUAGES', language);
    if (LANGUAGES_LABEL.includes(language)) {
      this.filterForm.addLanguage(languageSlug);
    } else {
      throw new Error('Something went wrong. Please choose a language from the drop down menu.');
    }
  }

  public removeLanguage(language: LanguagesLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const languageSlug: LanguagesSlug = getCodeIfExists('LANGUAGES', language);
    this.filterForm.removeLanguage(languageSlug);
  }

  public hasGenre(genre: GenresLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const genreSlug: GenresSlug = getCodeIfExists('GENRES', genre);
    if (
      this.movieGenres.includes(genre) &&
      !this.filterForm.get('type').value.includes(genreSlug)
    ) {
      this.filterForm.addType(genreSlug);
    } else {
      this.filterForm.removeType(genreSlug);
    }
  }

  public hasStatus(status: MovieStatusLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const productionStatusSlug: GenresSlug = getCodeIfExists('MOVIE_STATUS', status);
    if (
      this.movieProductionStatuses.includes(status) &&
      !this.filterForm.get('status').value.includes(productionStatusSlug)
    ) {
      this.filterForm.addStatus(productionStatusSlug);
    } else {
      this.filterForm.removeStatus(productionStatusSlug);
    }
  }

  public hasSalesAgent(salesAgent: string) {
    if (
      this.movieProductionStatuses.includes(status) &&
      !this.filterForm.get('salesAgent').value.includes(salesAgent)
    ) {
      this.filterForm.addStatus(salesAgent);
    } else {
      this.filterForm.removeStatus(salesAgent);
    }
  }

  public checkCertification(certification: CertificationsLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const certificationSlug: CertificationsSlug = getCodeIfExists('CERTIFICATIONS', certification);
    if (this.movieCertifications.includes(certification)) {
      this.filterForm.checkCertification(certificationSlug);
    }
  }

  public checkMedia(media: MediasLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const mediaSlug: MediasSlug = getCodeIfExists('MEDIAS', media);
    if (this.movieMedias.includes(media)) {
      this.filterForm.checkMedia(mediaSlug);
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
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const territorySlug: TerritoriesSlug = getCodeIfExists(
      'TERRITORIES',
      territory.option.viewValue
    );
    this.filterForm.addTerritory(territorySlug);
    this.territoryInput.nativeElement.value = '';
  }

  public addGenre(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;

    if ((value || '').trim() && !this.selectedGenres.includes(value)) {
      this.selectedGenres.push(value.trim());
    }

    this.filterForm.addGenre(value);
    this.genreControl.setValue('');
    this.genreInput.nativeElement.value = '';
  }

  public removeGenre(genre: string) {
    const index = this.selectedGenres.indexOf(genre);

    if (index >= 0) {
      this.selectedGenres.splice(index, 1);
      this.filterForm.removeGenre(genre);
    }
  }

  public addSalesAgent(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;

    if ((value || '').trim() && !this.selectedSalesAgents.includes(value)) {
      this.selectedSalesAgents.push(value.trim());
    }

    this.filterForm.addSalesAgent(value);
    this.salesAgentControl.setValue('');
    this.salesAgentInput.nativeElement.value = '';
  }

  public removeSalesAgent(salesAgent: string) {
    const index = this.selectedSalesAgents.indexOf(salesAgent);

    if (index >= 0) {
      this.selectedSalesAgents.splice(index, 1);
      this.filterForm.removeSalesAgent(salesAgent);
    }
  }

  public toggle$(movieId: string) {
    return this.basketService.isAddedToWishlist(movieId);
  }

  public addToWishlist(movie: Movie) {
    this.basketService.updateWishlist(movie);
    this.snackbar.open(
      `${movie.main.title.international} has been added to your selection.`,
      'close',
      { duration: 2000 }
    );
  }

  public removeFromWishlist(movie: Movie) {
    this.basketService.updateWishlist(movie);
    this.snackbar.open(
      `${movie.main.title.international} has been removed from your selection.`,
      'close',
      { duration: 2000 }
    );
  }

  public addSearchbarValue(value: MatAutocompleteSelectedEvent) {
    this.searchbarForm.get('text').setValue(value.option.viewValue);
  }

  public selectSearchType(value: any) {
    if (this.searchbarForm.get('type').value !== value) {
      this.searchbarForm.get('type').setValue(value);
    } else {
      this.searchbarForm.get('type').setValue('');
    }
  }

  ngOnDestroy() {
    this.salesAgentsSub.unsubscribe();
  }
}
