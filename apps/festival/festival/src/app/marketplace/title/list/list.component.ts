// Angular
import { Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Inject,
  OnDestroy
} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
// Blockframes
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import {
  LANGUAGES_LABEL,
  LanguagesSlug,
  MovieStatusLabel,
  MOVIE_STATUS_LABEL,
  LanguagesLabel,
} from '@blockframes/utils/static-model/types';
import { getCodeIfExists } from '@blockframes/utils/static-model/staticModels';
import { MovieAlgoliaResult } from '@blockframes/utils/algolia';
import { MoviesIndex } from '@blockframes/utils/algolia';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { staticModels } from '@blockframes/utils/static-model';
import { BUDGET_LIST } from '@blockframes/movie/form/budget/budget.form';
import { CatalogSearchForm } from '@blockframes/distribution-deals/form/search.form';
import { MovieService, Movie } from '@blockframes/movie';
import { NumberRange } from '@blockframes/utils/common-interfaces';
// RxJs
import { Observable, combineLatest, BehaviorSubject, Subscription } from 'rxjs';
import { startWith, map, debounceTime, switchMap, distinctUntilChanged, pluck, filter, share } from 'rxjs/operators';
// Others
import { Index } from 'algoliasearch';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private sub: Subscription;

  /** Observable of all movies */
  public movieSearchResults$: Observable<any>;

  /** Instance of the search form */
  public filterForm = new CatalogSearchForm();

  /** Observables on the languages selected */
  public selectedLanguages$: Observable<string[]>;

  /** Array of sorting options */
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  /** Flag to indicate either the movies should be presented as a card or a list */
  public listView: boolean;

  /** Data for UI */
  public movieProductionStatuses: MovieStatusLabel[] = MOVIE_STATUS_LABEL;

  /** Filter for autocompletion */
  public countries = staticModels['TERRITORIES'];
  public languagesFilter$: Observable<string[]>;

  /** Individual form controls for filtering */
  public languageControl: FormControl = new FormControl('', [
    Validators.required
  ]);
  public sortByControl: FormControl = new FormControl('Title');

  public budgetList: NumberRange[] = BUDGET_LIST;
  // UI
  /* main search bar */
  public searchbarTextControl: FormControl = new FormControl('');

  /* select list of all available genres */
  public availableGenres$: Observable<any>;

  /** seller org autocomplete search bar */
  public orgSearchResults$: Observable<any>;

  /** selected seller orgs to filter */
  public selectedSellers$ = new BehaviorSubject<string[]>([]);

  constructor(
    private movieService: MovieService,
    private router: Router,
    private cartService: CartService,
    private catalogCartQuery: CatalogCartQuery,
    private snackbar: MatSnackBar,
    private movieQuery: MovieQuery,
    @Inject(MoviesIndex) private movieIndex: Index,
    private analytics: FireAnalytics
  ) { }

  ngOnInit() {

    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    // UI RELATED OBSERVABLES

    /** fill languages autocomplete */
    this.languagesFilter$ = this.languageControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(300),
      map(value => this._languageFilter(value)),
    );

    /** listen on the list of added languages (this observable is used twice) */
    const languageValues$ = this.filterForm.languages.valueChanges.pipe(share());

    /** add languages to ui as chips */
    this.selectedLanguages$ = languageValues$.pipe(
      map(languages => Object.keys(languages))
    );

    /** fill the seller autocomplete with orgs queried from algolia */
    this.orgSearchResults$ = this.filterForm.seller.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      filter(text => text !== undefined && text !== '' && text !== ' '),
      switchMap(text => this.movieIndex.searchForFacetValues({facetName: 'orgName', facetQuery: text})),
      pluck('facetHits'),
      map(results => results.map(result => result.value)),
    );

    // ALGOLIA RELATED OBSERVABLES
    // these observables are organized in 3 levels
    //
    //                   (ui values)
    //                        |
    //  (search value) (facet filters) (budget filter)
    //             \         |         /
    //              (main algolia query)



    // LEVEL 1 (ui values)

    const genresFilter$: Observable<string[]> = this.filterForm.genres.valueChanges.pipe(
      startWith([]),
    );

    const originCountryFilter$: Observable<string[]> = this.filterForm.originCountries.valueChanges.pipe(
      startWith([]),
    );

    const statusesFilter$: Observable<string[]> = this.filterForm.productionStatus.valueChanges.pipe(
      startWith([]),
    );

    /** also listen on the languages added (`languageValues$`) and format them for the facetFilters$ aggregator */
    const languagesFacet$ = languageValues$.pipe(
      startWith({}),
      map(languages => {
        const keys = Object.keys(languages);

        // same shape as in the algolia index
        return {
          original: keys.filter(lang => languages[lang].original),
          dubbed: keys.filter(lang => languages[lang].dubbed),
          subtitle: keys.filter(lang => languages[lang].subtitle),
          caption: keys.filter(lang => languages[lang].caption),
        }
      }),
    );

    // LEVEL 2 (search value) (facet filters) (budget filter)

    /** listen on the main search bar values */
    const resultFilter$ = this.searchbarTextControl.valueChanges.pipe(
      startWith(''),
      debounceTime(200),
      distinctUntilChanged(),
    );


    /** Combining ui filters into algolia's facets parameter */
    const facetFilters$ = combineLatest([
      genresFilter$,
      originCountryFilter$,
      languagesFacet$,
      statusesFilter$,
      this.selectedSellers$
    ]).pipe(
      map(([genres, originCountries, languages, statuses, sellers]) => {
        return [
          [...genres.map(genre => `genres:${genre}`)], // same facet inside an array means OR for algolia
          [...originCountries.map(country => `originCountries:${country}`)],
          [
            ...languages.original.map(lang => `languages.original:${lang}`),
            ...languages.dubbed.map(lang => `languages.dubbed:${lang}`),
            ...languages.subtitle.map(lang => `languages.subtitle:${lang}`),
            ...languages.caption.map(lang => `languages.caption:${lang}`),
          ],
          [...statuses.map(status => `status:${status}`)],
          [...sellers.map(seller => `orgName:${seller}`)],
        ];
      }),
    );

    // LEVEL 3 (main algolia query)

    /** Observable that listen on the budget input and convert it into an algolia filter string */
    const budgetFilter$ = this.filterForm.budget.valueChanges.pipe(
      startWith([]),
      map(budgets => {
        const budgetsFrom = budgets.map(budget => `budget.from:${budget.from}`).join(' OR ');
        const budgetsTo = budgets.map(budget => `budget.to:${budget.to}`).join(' OR ');

        if ( budgets.length === 1) {
          return `${budgetsFrom} AND ${budgetsTo}`;
        } else if ( budgets.length > 1) {
          return `(${budgetsFrom}) AND (${budgetsTo})`;
        }
        return '';
      }),
    );


    /** Query algolia every time the search query or the filters changes */
    this.movieSearchResults$ = combineLatest([
      resultFilter$, // text query
      facetFilters$, // aggregated filters
      budgetFilter$, // budget filter
    ]).pipe(
      debounceTime(200),

      // prevent empty query (for example at the start of the page)
      filter(([textQuery , facetFilters, budgetFilter]) => (
        textQuery.length > 0 ||
        (facetFilters.length > 0 && facetFilters.some(facets => facets.length > 0)) ||
        budgetFilter.length > 0
      )),

      // perform actual query to algolia
      switchMap(([textQuery , facetFilters, budgetFilter]) => {
        return this.movieIndex.search<MovieAlgoliaResult>({
          query: textQuery,
          facetFilters,
          filters: budgetFilter,
        });
      }),

      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),

      // join retrieved movieIds from algolia with the movies from the state
      switchMap(movieIds => this.movieQuery.selectAll({
        filterBy: movie => movieIds.includes(movie.id)
      })),

      // display the first 10 movies from the state (no useless queries)
      // prevent the user to see an empty page at the beginning
      startWith(this.movieQuery.getAll({limitTo: 10})),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  // Click on a movie in list (instead of grid)
  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`c/o/marketplace/title/${id}`);
  }



  //----------------------------
  //       FILTER FORM        //
  //----------------------------

  // LANGUAGE FIELD

  /**
   * @description returns an array of strings for the autocompletion component
   * @param value string which got typed in into an input field
   */
  private _languageFilter(value: string): string[] {
    if (value) {
      return LANGUAGES_LABEL.filter(language => language.toLowerCase().includes(value.toLowerCase()));
    }
  }

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

  // BUDGET FIELD

  public hasBudget(budget: NumberRange) {
    const value = this.filterForm.get('estimatedBudget').value;
    if (!value.includes(budget)) {
      this.filterForm.get('estimatedBudget').setValue([...value, budget]);
    } else {
      const valueWithoutBudget = value.filter(v => v !== budget);
      this.filterForm.get('estimatedBudget').setValue(valueWithoutBudget);
    }
  }

  // PRODUCTION STATUS FIELD

  public hasStatus(status: MovieStatusLabel) {

    // We want to exchange the label for the slug,
    // because for our backend we need to store the slug.
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

  // SELLER FIELD

  public addSeller(seller: string) {
    const newSelectedSellers = [seller, ...this.selectedSellers$.getValue()];
    this.selectedSellers$.next(newSelectedSellers);
  }

  public removeSeller(index: number) {
    const newSelectedSellers = this.selectedSellers$.getValue();
    newSelectedSellers.splice(index, 1);
    this.selectedSellers$.next(newSelectedSellers);
  }

  //----------------------------
  //         WISHLIST         //
  //----------------------------

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
}
