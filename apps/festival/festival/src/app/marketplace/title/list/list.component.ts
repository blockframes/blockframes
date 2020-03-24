// Angular
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ViewChild,
  Inject
} from '@angular/core';
// Blockframes
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import {
  LANGUAGES_LABEL,
  LanguagesLabel,
  CertificationsLabel,
  CERTIFICATIONS_LABEL,
  CertificationsSlug,
  LanguagesSlug,
  MovieStatusLabel,
  MOVIE_STATUS_LABEL,
} from '@blockframes/utils/static-model/types';
import { getCodeIfExists } from '@blockframes/utils/static-model/staticModels';
import { ControlErrorStateMatcher } from '@blockframes/utils/form/validators/validators';
import { MovieAlgoliaResult, OrganizationsIndex, OrganizationAlgoliaResult } from '@blockframes/utils/algolia';
import { MoviesIndex } from '@blockframes/utils/algolia';
// RxJs
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { startWith, map, debounceTime, switchMap, tap, distinctUntilChanged, pluck, filter } from 'rxjs/operators';
// Others
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Index } from 'algoliasearch';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { NumberRange } from '@blockframes/utils/common-interfaces/range';
import { BUDGET_LIST } from '@blockframes/movie/movie/form/budget/budget.form';
import { filterMovie } from '@blockframes/movie/distribution-deals/form/filter.util';
import { CatalogSearchForm } from '@blockframes/movie/distribution-deals/form/search.form';
import { staticModels } from '@blockframes/utils/static-model';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { StoreType } from '@blockframes/movie/movie/+state/movie.firestore';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

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
  public movieProductionStatuses: MovieStatusLabel[] = MOVIE_STATUS_LABEL;
  public movieCertifications: CertificationsLabel[] = CERTIFICATIONS_LABEL;

  /* Filter for autocompletion */
  public countries = staticModels['TERRITORIES'];
  public languagesFilter$: Observable<string[]>;
  // public resultFilter$: Observable<any[]>;

  /* Individual form controls for filtering */
  public languageControl: FormControl = new FormControl('', [
    Validators.required
  ]);
  public sortByControl: FormControl = new FormControl('Title');

  /* Arrays for showing the selected countries in the UI */
  public selectedMovieCountries: string[] = [];
  public budgetList: NumberRange[] = BUDGET_LIST;
  public matcher = new ControlErrorStateMatcher();

  // private filterBy$ = this.filterForm.valueChanges.pipe(startWith(this.filterForm.value));
  // private sortBy$ = this.sortByControl.valueChanges.pipe(startWith(this.sortByControl.value));

  // TODO check for dead code above this line

  // UI
  /* main search bar */
  public searchbarTextControl: FormControl = new FormControl('');

  /* seller org autocomplete search bar */
  public orgSearchResults$: Observable<any>;

  // ALGOLIA

  /* Aggregation of all algolia filters */
  private facetFilters$: Observable<(string | string[])[]>;

  /* selected genres to filter*/
  public genresFilter$: Observable<string[]>;

  /* selected origin country to filter */
  public originCountryFilter$: Observable<string[]>;

  /* selected status to filter */
  public statusesFilter$: Observable<string[]>;

  /* selected seller orgs to filter */
  public selectedSellers$ = new BehaviorSubject<string[]>([]);

  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  public autoComplete: MatAutocompleteTrigger;

  constructor(
    private router: Router,
    private routerQuery: RouterQuery,
    private cartService: CartService,
    private catalogCartQuery: CatalogCartQuery,
    private snackbar: MatSnackBar,
    private movieQuery: MovieQuery,
    @Inject(MoviesIndex) private movieIndex: Index,
    @Inject(OrganizationsIndex) private orgsIndex: Index,
    private analytics: FireAnalytics
  ) { }

  ngOnInit() {

    /* The text string typed by the user in the search bar */
    // const searchQuery$: Observable<string> = this.searchbarTextControl.valueChanges.pipe(
      // debounceTime(200),
      // distinctUntilChanged(),
      // pluck('text'),
      // tap(t => console.log('searching movie', t)), // TODO REMOVE LOG
      // switchMap(text => this.movieIndex.search(text)),
      // pluck('hits'),
      // tap(res => console.log('movie result :', res)) // TODO REMOVE LOG
    // );

    // UI FILTERS

    this.genresFilter$ = this.filterForm.genres.valueChanges.pipe(
      startWith([]),
      tap(a => console.log('genres :', a)) // TODO REMOVE LOG
    );

    this.originCountryFilter$ = this.filterForm.originCountries.valueChanges.pipe(
      startWith([]),
      tap(a => console.log('countries :', a)) // TODO REMOVE LOG
    );

    this.statusesFilter$ = this.filterForm.productionStatus.valueChanges.pipe(
      startWith([]),
      tap(a => console.log('status :', a)) // TODO REMOVE LOG
    );

    this.languagesFilter$ = this.languageControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(300),
      map(value => this._languageFilter(value)),
    );

    // this.resultFilter$ = this.searchbarTextControl.valueChanges.pipe(
    //   startWith(''),
    //   tap(value => this.searchbarForm.get('text').setValue(value)),
    //   map(value => this._resultFilter(value))
    // );

    this.orgSearchResults$ = this.filterForm.seller.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter(text => text !== undefined && text !== '' && text !== ' '),
      tap(text => console.log('searching orgs :', text)), // TODO REMOVE LOG
      switchMap(text => this.movieIndex.searchForFacetValues({facetName: 'orgName', facetQuery: text})),
      pluck('facetHits'),
      map(results => results.map(result => result.value)),
      tap(names => console.log('orgs result :', names)), // TODO REMOVE LOG
    );

    /* Combining ui filters into algolia's facets */
    this.facetFilters$ = combineLatest([
      this.genresFilter$,
      this.originCountryFilter$,
      this.languagesFilter$,
      this.statusesFilter$,
      this.selectedSellers$
    ]).pipe(
      // startWith([]),
      map(([genres, originCountries, languages, statuses, sellers]) => {
        return [
          [...genres.map(genre => `movie.main.genres:${genre}`)], // same facet inside an array means OR for algolia
          [...originCountries.map(country => `movie.main.originCountries:${country}`)],
          // ...languages.map(language => `originalLanguages:${language}`),
          [...statuses.map(status => `movie.main.status:${status}`)],
          ...sellers.map(seller => `orgName:${seller}`),
        ];
      }),
      tap(facets => console.log('facets :', facets))
    );

    /* Query algolia every time the search query or the filters changes */
    this.movieSearchResults$ = combineLatest([
      this.searchbarTextControl.valueChanges,
      this.facetFilters$,
      // this.sortBy$
    ]).pipe(
      debounceTime(200),
      tap(values => console.log('query', values)),
      // distinctUntilChanged(),

      switchMap(([algoliaMovies , facetFilters]) => {
        // const movieIds = algoliaMovies.map(index => index.objectID);
        // return this.movieQuery.selectAll({
        //   sortBy: (a, b) => sortMovieBy(a, b, sortBy),
        //   filterBy: movie => filterMovie(movie, filterOptions) && movieIds.includes(movie.id)
        // })
        return this.movieIndex.search<MovieAlgoliaResult>({
          query: algoliaMovies,
          facetFilters
        })
      }),
      pluck('hits'),
      tap(result => console.log('algolia result :', result)),
      map(result => result.map(movie => movie.objectID)),
      switchMap(movieIds => this.movieQuery.selectAll({
        filterBy: movie => movieIds.includes(movie.id)
      })),
      tap(result => console.log('firestore result :', result)),
    );
  }

  public addSeller(seller: string) {
    const newSelectedSellers = [seller, ...this.selectedSellers$.getValue()];
    this.selectedSellers$.next(newSelectedSellers);
  }

  public removeSeller(index: number) {
    console.log('will remove', index, 'to', this.selectedSellers$.getValue()); // TODO REMOVE LOG
    const newSelectedSellers = this.selectedSellers$.getValue();
    newSelectedSellers.splice(index, 1);
    console.log('removed seller !', newSelectedSellers); // TODO REMOVE LOG
    this.selectedSellers$.next(newSelectedSellers);
  }

  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`c/o/marketplace/title/${id}`);
  }

  public get getCurrentYear(): number {
    return new Date().getFullYear();
  }

  public get searchbarForm(): FormGroup {
    return this.filterForm.get('searchbar');
  }

  public get searchbarTypeForm() {
    return this.filterForm.get('searchbar').get('type');
  }

  public get appName() {
    return this.routerQuery.getValue().state.root.data.app;
  }

  public toggleAutoCompletion() {
    this.autoComplete.closePanel();
  }

  /**
   * @description function for determine if FormGroup error should be shown.
   * We want to show this error only, if the children controls don't have any error.
   * @param formGroupName name of the form group which determine the logic.
   */
  public showFormGroupError(formGroupName: string): boolean {

    const filterHasErrors = (
      !this.filterForm.get('productionYear').get('from').hasError('pattern') &&
      !this.filterForm.get('productionYear').get('from').hasError('max') &&
      (
        !this.filterForm.get('productionYear').get('to').hasError('pattern') &&
        this.filterForm.get('productionYear').hasError('invalidRange')
      )
    )

    if (formGroupName === 'productionYear') {
      return filterHasErrors
    }
  }

  ////////////////////
  // Filter section //
  ////////////////////

  /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _languageFilter(value: string): string[] {
    // if (value) {
      return LANGUAGES_LABEL.filter(language => language.toLowerCase().includes(value.toLowerCase()));
    // }
  }

  /**
   * @description returns an array of strings for the autocompletion component.
   * Also we need to distinguish on what type the user want to have his results
   * @param value string which got typed in into an input field
   */
  // private _resultFilter(value: string): string[] {
  //   if (this.searchbarTypeForm.value === 'title') {
  //     return this.allTitles.filter(title => title.toLowerCase().includes(value.toLowerCase()));
  //   } else if (this.searchbarTypeForm.value === 'keywords') {
  //     return this.allKeywords.filter(word => word.toLowerCase().includes(value.toLowerCase()));
  //   } else if (this.searchbarTypeForm.value === 'director') {
  //     return this.allDirectors.filter(director => {
  //       return director.toLowerCase().includes(value.toLowerCase());
  //     });
  //   }
  // }

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
      this.analytics.event('addedLanguage', { language });
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
    this.analytics.event('removedLanguage', { language });
  }

  public hasBudget(budget: NumberRange) {
    const value = this.filterForm.get('estimatedBudget').value;
    if (!value.includes(budget)) {
      this.filterForm.get('estimatedBudget').setValue([...value, budget]);
    } else {
      const valueWithoutBudget = value.filter(v => v !== budget);
      this.filterForm.get('estimatedBudget').setValue(valueWithoutBudget);
    }
  }

  public hasStatus(status: MovieStatusLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const productionStatusSlug = getCodeIfExists('MOVIE_STATUS', status);
    if (
      this.movieProductionStatuses.includes(status) &&
      !this.filterForm.productionStatus.value.includes(productionStatusSlug)
    ) {
      this.filterForm.addStatus(productionStatusSlug);
      this.analytics.event('addedMovieStatus', { status });
    } else {
      this.filterForm.removeStatus(productionStatusSlug);
      this.analytics.event('removedMovieStatus', { status });
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

  public toggle$(movieId: string) {
    return this.catalogCartQuery.isAddedToWishlist(movieId);
  }

  public addToWishlist(movie: Movie) {
    this.cartService.updateWishlist(movie);
    this.snackbar.open(
      `${movie.main.title.international} has been added to your selection.`,
      'close',
      { duration: 2000 }
    );
    this.analytics.event('addedToWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
  }

  public removeFromWishlist(movie: Movie) {
    this.cartService.updateWishlist(movie);
    this.snackbar.open(
      `${movie.main.title.international} has been removed from your selection.`,
      'close',
      { duration: 2000 }
    );
    this.analytics.event('removedFromWishlist', {
      movieId: movie.id,
      movieTitle: movie.main.title.original
    });
  }

  public addSearchbarValue(value: MatAutocompleteSelectedEvent) {
    this.searchbarForm.get('text').setValue(value.option.viewValue);
  }

  public selectSearchType(type: string) {
    if (this.searchbarForm.value !== type) {
      this.searchbarTypeForm.setValue(type);
      this.analytics.event('searchbarSearchType', { type });
    } else {
      this.searchbarTypeForm.setValue('');
    }
  }

  /** Check storeType or uncheck it if it's already in the array. */
  public checkStoreType(storeType: StoreType) {
    this.filterForm.checkStoreType(storeType);
  }
}
