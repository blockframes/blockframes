// Angular
import { Router } from '@angular/router';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger
} from '@angular/material/autocomplete';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ElementRef,
  ViewChild,
  HostBinding,
  Inject
} from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
// Blockframes
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { AnalyticsEvents } from '@blockframes/utils/analytics/analyticsEvents';
import {
  LANGUAGES_LABEL,
  LanguagesLabel,
  CertificationsLabel,
  CERTIFICATIONS_LABEL,
  TERRITORIES_LABEL,
  CertificationsSlug,
  LanguagesSlug,
  TerritoriesSlug,
  MovieStatusLabel,
  MOVIE_STATUS_LABEL,
  TERRITORIES_SLUG,
} from '@blockframes/utils/static-model/types';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { ControlErrorStateMatcher } from '@blockframes/utils/form/validators/validators';
import { MovieAlgoliaResult } from '@blockframes/utils/algolia';
import { MoviesIndex } from '@blockframes/utils/algolia';
// RxJs
import { Observable, combineLatest, of, from } from 'rxjs';
import { startWith, map, debounceTime, switchMap, tap, distinctUntilChanged } from 'rxjs/operators';
// Others
import { filterMovie, filterMovieWithAvails } from '@blockframes/catalog/filter.util';
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Index } from 'algoliasearch';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { NumberRange } from '@blockframes/utils/common-interfaces/range';
import { BUDGET_LIST } from '@blockframes/movie/movie/form/budget/budget.form';
import { CatalogSearchForm, AvailsSearchForm } from '@blockframes/catalog/form/search.form';
import { DistributionDealService } from '@blockframes/movie/distribution-deals/+state';
import { asyncFilter } from '@blockframes/utils/helpers';
import { staticModels } from '@blockframes/utils/static-model';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';

@Component({
  selector: 'catalog-movie-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'catalog-search';

  /** Algolia search results */
  private algoliaSearchResults$: Observable<MovieAlgoliaResult[]>;

  /* Observable of all movies */
  public movieSearchResults$: Observable<Movie[]>;

  /* Instance of the search form */
  public filterForm = new CatalogSearchForm();
  public availsForm = new AvailsSearchForm();

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
  public resultFilter$: Observable<any[]>;

  /* Individual form controls for filtering */
  public languageControl: FormControl = new FormControl('', [
    Validators.required
  ]);
  public sortByControl: FormControl = new FormControl('');
  public searchbarTextControl: FormControl = new FormControl('');

  private filterBy$ = this.filterForm.valueChanges.pipe(startWith(this.filterForm.value));
  private filterByAvails$ = this.availsForm.valueChanges.pipe(startWith(this.availsForm.value));
  private sortBy$ = this.sortByControl.valueChanges.pipe(startWith(this.sortByControl.value));

  /* Arrays for showing the selected countries in the UI */
  public selectedMovieCountries: string[] = [];

  public budgetList: NumberRange[] = BUDGET_LIST;

  public matcher = new ControlErrorStateMatcher();
  public isMobile: boolean = this.breakpointObserver.isMatched('(max-width: 599px)');

  @ViewChild('autoCompleteInput', { static: false, read: MatAutocompleteTrigger })
  public autoComplete: MatAutocompleteTrigger;

  constructor(
    private router: Router,
    private routerQuery: RouterQuery,
    private cartService: CartService,
    private catalogCartQuery: CatalogCartQuery,
    private snackbar: MatSnackBar,
    private movieQuery: MovieQuery,
    private dealService: DistributionDealService,
    private breakpointObserver: BreakpointObserver,
    @Inject(MoviesIndex) private movieIndex: Index,
    private analytics: FireAnalytics
  ) {}

  ngOnInit() {
    this.algoliaSearchResults$ = this.searchbarForm.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(searchText => {
        return new Promise<MovieAlgoliaResult[]>((res, rej) => {
          this.movieIndex.search(searchText.text, (err, result) =>
            err ? rej(err) : res(result.hits)
          );
        });
      }),
    );

    this.movieSearchResults$ = combineLatest([
      this.algoliaSearchResults$,
      this.filterBy$,
      this.filterByAvails$,
      this.sortBy$
    ]).pipe(
      switchMap(([algoliaMovies, filterOptions, availsOptions, sortBy]) => {
        const movieIds = algoliaMovies.map(index => index.objectID);
        return this.movieQuery.selectAll({
          sortBy: (a, b) => sortMovieBy(a, b, sortBy),
          filterBy: movie => filterMovie(movie, filterOptions) && movieIds.includes(movie.id)
        }).pipe(
          switchMap(movies => {

            // If Avails filter button is clicked
            if (!availsOptions.isActive) {
              return of(movies)
            }

            return from(
              asyncFilter(movies, async movie => {
                  // Filters the deals before sending them to the avails filter function
                  if (!movie.distributionDeals) {
                    // If movie has no deals, it means there is also no mandate deal,
                    // Archipel can't sells rights for this movie, so we don't display it.
                    return false;
                  }

                  const mandateDeals = await this.dealService.getMandateDeals(movie);
                  const mandateDealIds = mandateDeals.map(deal => deal.id);
                  const filteredDeals = movie.distributionDeals.filter(deal => !mandateDealIds.includes(deal.id));
                  return filterMovieWithAvails(filteredDeals, availsOptions, mandateDeals);
              })
            )
          })
        );
      }),
    )

    this.languagesFilter$ = this.languageControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(value => this._languageFilter(value))
    );

    this.resultFilter$ = this.searchbarTextControl.valueChanges.pipe(
      startWith(''),
      tap(value => this.searchbarForm.get('text').setValue(value)),
      map(value => this._resultFilter(value))
    );
  }

  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`c/o/marketplace/${id}`);
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
    const availsHasErrors = (
      !this.availsForm.get('terms').get('from').hasError('min') &&
      this.availsForm.get('terms').hasError('invalidRange')
    )

    if (formGroupName === 'productionYear') {

      return filterHasErrors
    } else {

      return availsHasErrors;
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
    if (value) {
      return LANGUAGES_LABEL.filter(language => language.toLowerCase().includes(value.toLowerCase()));
    }
  }

  /**
   * @description returns an array of strings for the autocompletion component.
   * Also we need to distinguish on what type the user want to have his results
   * @param value string which got typed in into an input field
   */
  private _resultFilter(value: string): string[] {
    if (this.searchbarTypeForm.value === 'title') {
      return this.allTitles.filter(title => title.toLowerCase().includes(value.toLowerCase()));
    } else if (this.searchbarTypeForm.value === 'keywords') {
      return this.allKeywords.filter(word => word.toLowerCase().includes(value.toLowerCase()));
    } else if (this.searchbarTypeForm.value === 'director') {
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
      this.analytics.event(AnalyticsEvents.addedLanguage, { language });
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
    this.analytics.event(AnalyticsEvents.removedLanguage, { language });
  }

  public hasBudget(budget: NumberRange) {
    const value = this.filterForm.get('estimatedBudget').value;
    if (!value.includes(budget)) {
      this.filterForm.get('estimatedBudget').setValue([...value, budget]);
    } else {
      const valueWithoutBudget = value.filter(v =>  v !== budget);
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
      !this.filterForm.get('status').value.includes(productionStatusSlug)
    ) {
      this.filterForm.addStatus(productionStatusSlug);
      this.analytics.event(AnalyticsEvents.addedMovieStatus, { status });
    } else {
      this.filterForm.removeStatus(productionStatusSlug);
      this.analytics.event(AnalyticsEvents.removedMovieStatus, { status });
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
    this.analytics.event(AnalyticsEvents.addedToWishlist, {
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
    this.analytics.event(AnalyticsEvents.removedFromWishlist, {
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
      this.analytics.event(AnalyticsEvents.searchbarSearchType, { type });
    } else {
      this.searchbarTypeForm.setValue('');
    }
  }
}
