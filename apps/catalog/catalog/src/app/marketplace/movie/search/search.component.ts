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
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
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
import { MovieAlgoliaResult } from '@blockframes/utils/algolia';
import { MoviesIndex } from '@blockframes/utils/algolia';
// RxJs
import { Observable, combineLatest, of, from } from 'rxjs';
import { startWith, map, debounceTime, switchMap, tap, distinctUntilChanged, pluck } from 'rxjs/operators';
// Others
import { CartService } from '@blockframes/organization/cart/+state/cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Index } from 'algoliasearch';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CatalogCartQuery } from '@blockframes/organization/cart/+state/cart.query';
import { NumberRange } from '@blockframes/utils/common-interfaces/range';
import { BUDGET_LIST } from '@blockframes/movie/form/budget/budget.form';
import { filterMovie, filterMovieWithAvails } from '@blockframes/distribution-rights/form/filter.util';
import { CatalogSearchForm, AvailsSearchForm } from '@blockframes/distribution-rights/form/search.form';
import { DistributionRightService } from '@blockframes/distribution-rights/+state';
import { asyncFilter } from '@blockframes/utils/helpers';
import { staticModels } from '@blockframes/utils/static-model';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { StoreType } from '@blockframes/movie/+state/movie.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-movie-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit {

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
  public sortByControl: FormControl = new FormControl('Title');
  public searchbarTextControl: FormControl = new FormControl('');

  private filterBy$ = this.filterForm.valueChanges.pipe(startWith(this.filterForm.value));
  private filterByAvails$ = this.availsForm.valueChanges.pipe(startWith(this.availsForm.value));
  private sortBy$ = this.sortByControl.valueChanges.pipe(startWith(this.sortByControl.value));

  /* Arrays for showing the selected countries in the UI */
  public selectedMovieCountries: string[] = [];

  public budgetList: NumberRange[] = BUDGET_LIST;

  public matcher = new ControlErrorStateMatcher();

  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  public autoComplete: MatAutocompleteTrigger;

  constructor(
    private router: Router,
    private routerQuery: RouterQuery,
    private cartService: CartService,
    private catalogCartQuery: CatalogCartQuery,
    private snackbar: MatSnackBar,
    private movieQuery: MovieQuery,
    private rightService: DistributionRightService,
    @Inject(MoviesIndex) private movieIndex: Index,
    private analytics: FireAnalytics,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Library')
  }

  ngOnInit() {
    this.algoliaSearchResults$ = this.searchbarForm.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      startWith(''),
      pluck('text'),
      switchMap(text => this.movieIndex.search(text)),
      pluck('hits'),
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
                // Filters the rights before sending them to the avails filter function
                if (movie.distributionRights && movie.distributionRights.length) {
                  const mandateRights = await this.rightService.getMandateRights(movie);
                  const mandateRightIds = mandateRights.map(right => right.id);
                  const filteredRights = movie.distributionRights.filter(right => !mandateRightIds.includes(right.id));
                  return filterMovieWithAvails(filteredRights, availsOptions, mandateRights);
                }
                // If movie has no rights, it means there is also no mandate right,
                // Archipel can't sells rights for this movie, so we don't display it.
                return false;
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
      !this.availsForm.get('terms').get('start').hasError('min') &&
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
      !this.filterForm.get('productionStatus').value.includes(productionStatusSlug)
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
      `Title ${movie.main.title.international} has been added.`,
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
      `Title ${movie.main.title.international} has been removed.`,
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

  public applyAvailsFilter() {
    this.availsForm.get('isActive').setValue(true);
    this.availsForm.disable({ onlySelf: false });
    // TODO: use controls for territories and medias to make it disablable
  }

  public deactivateAvailsFilter() {
    this.availsForm.get('isActive').setValue(false);
    this.availsForm.enable();
    this.availsForm.get('territory').enable();
  }

  /** Check storeType or uncheck it if it's already in the array. */
  public checkStoreType(storeType: StoreType) {
    this.filterForm.checkStoreType(storeType);
  }
}
