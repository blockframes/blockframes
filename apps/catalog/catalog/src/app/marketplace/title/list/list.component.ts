import {
  OnInit,
  OnDestroy,
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { where } from 'firebase/firestore';

// RxJs
import { SearchResponse } from '@algolia/client-search';
import { Observable, Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, shareReplay, tap } from 'rxjs/operators';

// Blockframes
import { algolia, centralOrgId } from '@env';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import {
  StoreStatus,
  Mandate,
  Sale,
  AlgoliaMovie,
  GetKeys,
  AvailsFilter,
  filterContractsByTitle,
  availableTitle,
  FullMandate,
  getMandateTerms,
  recursiveSearch,
  Term,
  AlgoliaResult
} from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketService } from '@blockframes/contract/bucket/service';
import { TermService } from '@blockframes/contract/term/service';
import { decodeDate, decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService } from '@blockframes/contract/contract/service';
import { MovieSearchForm, createMovieSearch, Versions, MovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';
import algoliasearch from 'algoliasearch';

const mandatesQuery = [
  where('type', '==', 'mandate'),
  where('buyerId', '==', centralOrgId.catalog),
  where('status', '==', 'accepted')
];

const salesQuery = [
  where('type', '==', 'sale'),
  where('status', '==', 'accepted')
];

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy, OnInit, AfterViewInit {
  private movieResultsState = new BehaviorSubject<(AlgoliaMovie & { mandates: FullMandate[] })[]>(null);
  public movies$: Observable<(AlgoliaMovie & { mandates: FullMandate[] })[]>;
  private movieIds: string[] = [];

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm();
  public exporting = false;
  public nbHits: number;
  public hitsViewed$ = new BehaviorSubject<number>(50);
  public isLoading = false;

  private subs: Subscription[] = [];

  // Caching related attributes
  private previousSearch: string;
  private currentAvailsSearch: string;
  private previousAvailsSearch: string;
  private cachedAvails: Record<string, Record<string, (AlgoliaMovie & { mandates: FullMandate[] })>> = {};
  private cachedDatabaseData: { mandates: Mandate[], sales: Sale[], mandateTerms: Term[], saleTerms: Term[] };
  private cachedAlgoliaResults: AlgoliaResult<AlgoliaMovie>;

  private search$ = combineLatest([
    this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
    this.availsForm.value$,
    this.hitsViewed$
  ]).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService,
    private snackbar: MatSnackBar,
    private bucketService: BucketService,
    private router: Router,
    private pdfService: PdfService,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  async ngOnInit() {
    this.movies$ = this.movieResultsState.asObservable();

    this.search$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      tap(([_, availsValue]) => {
        const search: { search: MovieSearch, avails: AvailsFilter } = { search: { ...this.searchForm.value }, avails: availsValue }; // TODO #8992 typing here & other apps
        delete search.search.page;
        const currentSearch = JSON.stringify(search);

        if (this.previousSearch !== currentSearch) {
          if (this.searchForm.page.value !== 0) {
            this.searchForm.page.setValue(0, { onlySelf: false, emitEvent: false });
            encodeUrl<MovieSearch>(this.router, this.route, this.searchForm.value);
          }

          // TODO https://github.com/blockframes/blockframes/issues/8894#issuecomment-1297062856
          this.hitsViewed$.next(50);


          // TODO #8894 afficher loader si on change les filtres (sur les 3 apps)
        }

        this.previousSearch = currentSearch;
      }),
      switchMap(async ([_, availsValue, hitsViewed]) => {
        if (this.availsForm.valid) await this.cacheAvails(availsValue);
        return hitsViewed;
      }),
      switchMap(async hitsViewed => [await this.searchForm.recursiveSearch(), hitsViewed]),
    ).subscribe(([movies, hitsViewed]: [SearchResponse<AlgoliaMovie>, number]) => {
      // if availsForm is invalid, put all the movies from algolia
      if (this.availsForm.invalid) {
        this.nbHits = movies.hits.length;
        this.movieIds = movies.hits.map(m => m.objectID);
        this.movieResultsState.next(movies.hits.map(m => ({ ...m, mandates: [] as FullMandate[] })).slice(0, hitsViewed));
      } else {
        // We keep only the results that have avails
        const results = movies.hits.map(movie => this.cachedAvails[this.currentAvailsSearch][movie.objectID]).filter(m => !!m);

        this.nbHits = results.length;
        this.movieIds = results.map(m => m.objectID);
        this.movieResultsState.next(results.slice(0, hitsViewed));
      }
    });
  }

  ngAfterViewInit(): void {
    const decodedData: { search: MovieSearch, avails: AvailsFilter } = decodeUrl(this.route);
    this.load(decodedData);

    const sub = this.search$.pipe(
      debounceTime(1000),
    ).subscribe(([search, avails]) => {
      encodeUrl(this.router, this.route, {
        search: { // TODO #8992 typing here & clean
          query: search.query,
          genres: search.genres,
          originCountries: search.originCountries,
          contentType: search.contentType,
          languages: search.languages,
          minReleaseYear: search.minReleaseYear > 0 ? search.minReleaseYear : undefined,
          runningTime: search.runningTime,
          page: search.page
        },
        avails, // TODO #8992 typing here
      })
    });

    this.subs.push(sub);
  }

  loadMore() {
    this.hitsViewed$.next(this.hitsViewed$.value + 50);
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus] });
    this.searchForm.reset(initial);
    this.availsForm.reset();
    this.cdr.markForCheck();
  }

  async addAvail(title: (AlgoliaMovie & { mandates: FullMandate[] })) {
    if (this.availsForm.invalid) {
      this.snackbar.open('Please fill in your Avail Search Criteria first.', 'close', { duration: 5000 })
      return;
    }

    const availResults = getMandateTerms(this.availsForm.value, title.mandates);
    if (!availResults.length) {
      this.snackbar.open('This title is not available', 'close', { duration: 5000 });
      return;
    }

    const isInSelection = await this.bucketService.isInSelection(this.availsForm.value, title.objectID);
    if (isInSelection) {
      this.snackbar.open(`${title.title.international} is already in your Selection`, 'close', { duration: 5000 });
      return;
    }

    const results = availResults.map(res => ({
      titleId: title.objectID,
      parentTermId: res.term.id,
      avail: res.avail
    }));

    this.bucketService.addBatchTerms(results);

    this.snackbar.open(`${title.title.international} was added to your Selection`, 'GO TO SELECTION', { duration: 4000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/c/o/marketplace/selection']));
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  async export() {
    if (this.movieIds.length >= this.pdfService.exportLimit) {
      this.snackbar.open('Sorry, you can\'t have an export with that many titles.', 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    const exportStatus = await this.pdfService.download({ titleIds: this.movieIds, forms: { avails: this.availsForm, search: this.searchForm } });
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
  }

  load(parsedData: { search: MovieSearch, avails: AvailsFilter }) {
    // Search Form
    const languages = this.searchForm.languages.get('languages') as FormList<GetKeys<'languages'>>;
    const versions = this.searchForm.languages.get('versions') as FormEntity<EntityControl<Versions>, Versions>;

    // patch everything
    this.searchForm.patchValue(parsedData.search); // TODO #8894 hard reset ?

    // ensure FromList are also patched
    this.searchForm.genres.patchAllValue(parsedData.search?.genres);
    this.searchForm.originCountries.patchAllValue(parsedData.search?.originCountries);
    languages.patchAllValue(parsedData.search?.languages?.languages);
    versions.patchValue(parsedData.search?.languages?.versions);
    this.searchForm.minReleaseYear.patchValue(parsedData.search?.minReleaseYear);
    this.searchForm.runningTime.patchValue(parsedData.search?.runningTime);

    // Avails Form
    if (parsedData.avails?.duration?.from) parsedData.avails.duration.from = decodeDate(parsedData.avails.duration.from); // TODO #8992 needed decodeDate?
    if (parsedData.avails?.duration?.to) parsedData.avails.duration.to = decodeDate(parsedData.avails.duration.to);
    if (!parsedData.avails.medias) parsedData.avails.medias = [];

    this.availsForm.patchValue(parsedData.avails);
  }

  // ----------------------------
  //          DATA CACHING
  // ----------------------------

  private async cacheAlgoliaResults() {
    if (this.cachedAlgoliaResults) return;

    const movieIndex = algoliasearch(algolia.appId, algolia.searchKey).initIndex(algolia.indexNameMovies['catalog']);

    const search = { facetFilters: [[`storeStatus:${this.storeStatus}`]] };
    this.cachedAlgoliaResults = await recursiveSearch<AlgoliaMovie>(movieIndex, search);
  }

  private async cacheDatabaseData() {
    if (this.cachedDatabaseData) return;

    const [mandates, sales, terms] = await Promise.all([
      this.contractService.getValue<Mandate>(mandatesQuery),
      this.contractService.getValue<Sale>(salesQuery),
      this.termService.getValue(),
    ]);

    const mandateTermIds = mandates.map(mandate => mandate.termIds).flat();
    const mandateTerms = terms.filter(t => mandateTermIds.includes(t.id));

    const saleTermIds = sales.map(sale => sale.termIds).flat();
    const saleTerms = terms.filter(t => saleTermIds.includes(t.id));

    this.cachedDatabaseData = { mandates, sales, mandateTerms, saleTerms };
  }

  private async cacheAvails(availsValue: AvailsFilter) {

    this.currentAvailsSearch = JSON.stringify(availsValue);
    if (this.previousAvailsSearch !== this.currentAvailsSearch) {

      this.isLoading = true;
      // Let some time to loader to display before high CPU usage
      await new Promise<void>(res => setTimeout(res, 500));

      await Promise.all([
        this.cacheAlgoliaResults(),
        this.cacheDatabaseData()
      ]);

      const { mandates, mandateTerms, sales, saleTerms } = this.cachedDatabaseData;

      if (!this.cachedAvails[this.currentAvailsSearch]) this.cachedAvails[this.currentAvailsSearch] = {};
      const alreadyCached = !!Object.keys(this.cachedAvails[this.currentAvailsSearch]).length;

      if (mandates.length && !alreadyCached) {
        const results = this.cachedAlgoliaResults.hits.map(movie => {
          const res = filterContractsByTitle(movie.objectID, mandates, mandateTerms, sales, saleTerms);
          const availableMandates = availableTitle(availsValue, res.mandates, res.sales);
          return { ...movie, mandates: availableMandates };
        }).filter(m => !!m.mandates.length);
        results.forEach(hit => this.cachedAvails[this.currentAvailsSearch][hit.objectID] = hit);

      }
    }

    this.previousAvailsSearch = this.currentAvailsSearch;
    this.isLoading = false;
  }
}
