// Angular
import { Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { FormControl } from '@angular/forms';
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

  /* Observables on the languages selected */
  public languages$ = this.filterForm.valueChanges.pipe(
    startWith(this.filterForm.value),
    map(({ languages }) => Object.keys(languages))
  );

  /* Array of sorting options */
  public sortOptions: string[] = ['All films', 'Title', 'Director', /* 'Production Year' #1146 */];

  /* Flag to indicate either the movies should be presented as a card or a list */
  public listView: boolean;

  /* Data for UI */
  public movieGenres: GenresLabel[] = GENRES_LABEL;
  public movieProductionStatuses: MovieStatusLabel[] = MOVIE_STATUS_LABEL;
  public movieCertifications: CertificationsLabel[] = CERTIFICATIONS_LABEL;
  public movieMedias: MediasLabel[] = MEDIAS_LABEL;

  /* Filter for autocompletion */
  public territoriesFilter: Observable<string[]>;
  public languagesFilter: Observable<string[]>;
  public salesAgentFilter: Observable<string[]>;

  /* Individual form controls for filtering */
  public languageControl: FormControl = new FormControl('', [
    Validators.required,
    languageValidator
  ]);
  public territoryControl: FormControl = new FormControl('');
  public salesAgentControl: FormControl = new FormControl('');
  public sortByControl: FormControl = new FormControl('');

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
  @ViewChild('auto', { static: false }) matAutocomplete: MatAutocomplete;

  /* Flags for the Territories chip input */
  public visible = true;
  public selectable = true;
  public removable = true;

  /* Number of available movies in the database */
  public availableMovies: number;

  public matcher = new ControlErrorStateMatcher();

  @ViewChild('territoryInput', { static: false }) territoryInput: ElementRef<HTMLInputElement>;

  constructor(
    private movieQuery: MovieQuery,
    private router: Router,
    private movieService: MovieService,
    private basketService: BasketService,
    private snackbar: MatSnackBar
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
          this.movieGenres= this.movieGenres.filter(value => !removeGenre.includes(value));
          return movies.filter(movie => {
            return filterMovie(movie, filterOptions);
          });
        }
      }),
      tap(movies => (this.availableMovies = movies.length))
    );

    this.salesAgentsSub = this.movieQuery.selectAll().pipe(
      tap(movies => {
        movies.forEach(movie => {
          if (
            !!movie.salesAgentDeal.salesAgent &&
            !!movie.salesAgentDeal.salesAgent.displayName &&
            !this.salesAgents.includes(movie.salesAgentDeal.salesAgent.displayName)
          )
            this.salesAgents.push(movie.salesAgentDeal.salesAgent.displayName);
        })
      })
    ).subscribe()

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

    this.salesAgentFilter = this.salesAgentControl.valueChanges.pipe(
      startWith(''),
      map(salesAgent =>
        salesAgent ? this._salesAgentsfilter(salesAgent) : this.salesAgents
      )
    );
  }

  public goToMovieDetails(id: string) {
    this.router.navigateByUrl(`layout/o/catalog/${id}`);
  }

  public get getCurrentYear(): number {
    return new Date().getFullYear();
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

  private _territoriesFilter(territory: string): string[] {
    const filterValue = territory.toLowerCase();
    return TERRITORIES_LABEL.filter(movieTerritory => {
      return movieTerritory.toLowerCase().includes(filterValue);
    });
  }

  private _languageFilter(value: string): string[] {
    return LANGUAGES_LABEL.filter(language => language.toLowerCase().includes(value.toLowerCase()));
  }

  private _salesAgentsfilter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.salesAgents.filter(salesAgent => salesAgent.toLowerCase().indexOf(filterValue) === 0)
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
    this.snackbar.open(`${movie.main.title.international} has been added to your selection.`, 'close', { duration: 2000 });
  }

  public removeFromWishlist(movie: Movie) {
    this.basketService.updateWishlist(movie);
    this.snackbar.open(`${movie.main.title.international} has been removed from your selection.`, 'close', { duration: 2000 });
  }

  ngOnDestroy() {
    this.salesAgentsSub.unsubscribe();
  }
}
