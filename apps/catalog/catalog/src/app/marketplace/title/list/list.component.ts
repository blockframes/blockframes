import {
  OnInit,
  OnDestroy,
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Inject,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { where } from 'firebase/firestore';

// RxJs
import { SearchResponse } from '@algolia/client-search';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip, shareReplay, map } from 'rxjs/operators';

// Blockframes
import { centralOrgId } from '@env';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { Term, StoreStatus, Mandate, Sale, Bucket, AlgoliaMovie, App, GetKeys } from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketService } from '@blockframes/contract/bucket/service';
import { TermService } from '@blockframes/contract/term/service';
import { decodeDate, decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService } from '@blockframes/contract/contract/service';
import { MovieSearchForm, createMovieSearch, Versions } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AvailsFilter, filterContractsByTitle, availableTitle, FullMandate, getMandateTerms } from '@blockframes/contract/avails/avails';
import { APP } from '@blockframes/utils/routes/utils';
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy, OnInit {

  public movies$: Observable<(AlgoliaMovie & { mandates: FullMandate[] })[]>;

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm();
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;
  public disabledLoad = true;
  public enabledSave = false;
  public activeSave = false;

  private subs: Subscription[] = [];

  private queries$: Observable<{ mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[] }>;

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
    @Inject(APP) public app: App,

  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  async ngOnInit() {
    this.searchForm.hitsPerPage.setValue(1000);
    const mandatesQuery = [
      where('type', '==', 'mandate'),
      where('buyerId', '==', centralOrgId.catalog),
      where('status', '==', 'accepted')
    ];

    const salesQuery = [
      where('type', '==', 'sale'),
      where('status', '==', 'accepted')
    ];

    this.queries$ = combineLatest([
      this.contractService.valueChanges(mandatesQuery),
      this.contractService.valueChanges(salesQuery),
    ]).pipe(
      switchMap(([mandates, sales]) => {
        const mandateTermIds = mandates.map(mandate => mandate.termIds).flat();
        return this.termService.valueChanges(mandateTermIds).pipe(map(mandateTerms => ({ mandates, mandateTerms, sales })));
      }),
      switchMap(({ mandates, mandateTerms, sales }) => {
        const saleTermIds = sales.map(sale => sale.termIds).flat();
        return this.termService.valueChanges(saleTermIds).pipe(map(saleTerms => ({ mandates, mandateTerms, sales, saleTerms })));
      }),
      startWith({ mandates: [], mandateTerms: [], sales: [], saleTerms: [] }),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

    const {
      search,
      avails = {}
    } = decodeUrl(this.route);

    if (avails.duration?.from) avails.duration.from = decodeDate(avails.duration.from);
    if (avails.duration?.to) avails.duration.to = decodeDate(avails.duration.to);

    const queryParamsSub = this.route.queryParams.subscribe(_ => this.activeUnactiveButtons());
    this.subs.push(queryParamsSub);

    this.patchSearchValues(search);
    this.availsForm.patchValue(avails);

    const search$ = combineLatest([
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
      this.availsForm.value$,
      this.bucketService.active$.pipe(startWith(undefined)),
      this.queries$,
    ]).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    const searchSub = search$.pipe(
      skip(1)
    ).subscribe(([search, avails]) => encodeUrl(this.router, this.route, {
      search: {
        query: search.query,
        genres: search.genres,
        originCountries: search.originCountries,
        contentType: search.contentType,
        release: search.release,
        languages: search.languages.languages,
        versions: search.languages.versions,
        minReleaseYear: search.minReleaseYear > 0 ? search.minReleaseYear : undefined,
        runningTime: search.runningTime
      },
      avails,
    }));
    this.subs.push(searchSub);

    this.movies$ = search$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(async ([_, availsValue, bucketValue, queries]) => [await this.searchForm.search(true), availsValue, bucketValue, queries]),
    ).pipe(
      map(([movies, availsValue, bucketValue, { mandates, mandateTerms, sales, saleTerms }]: [SearchResponse<AlgoliaMovie>, AvailsFilter, Bucket, { mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[] }]) => {
        // if availsForm is invalid, put all the movies from algolia
        if (this.availsForm.invalid) return movies.hits.map(m => ({ ...m, mandates: [] as FullMandate[] }));
        if (!mandates.length) return [];
        return movies.hits.map(movie => {
          const res = filterContractsByTitle(movie.objectID, mandates, mandateTerms, sales, saleTerms, bucketValue);
          const availableMandates = availableTitle(availsValue, res.mandates, res.sales, res.bucketContracts);
          return { ...movie, mandates: availableMandates };
        }).filter(m => !!m.mandates.length);
      }),
    );
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus], hitsPerPage: 1000 });
    this.searchForm.reset(initial);
    this.availsForm.reset();
    this.cdr.markForCheck();
  }

  async addAvail(title: (AlgoliaMovie & { mandates: FullMandate[] })) {
    if (this.availsForm.invalid) {
      this.snackbar.open('Fill in avails filter to add title to your Selection.', 'close', { duration: 5000 })
      return;
    }

    const availResults = getMandateTerms(this.availsForm.value, title.mandates);
    if (!availResults.length) {
      this.snackbar.open('This title is not available', 'close', { duration: 5000 });
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

  async export(movies: AlgoliaMovie[]) {
    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    await this.pdfService.download(movies.map(m => m.objectID));
    snackbarRef.dismiss();
    this.exporting = false;
  }

  patchSearchValues(search) {
    const languages = this.searchForm.languages.get('languages') as FormList<GetKeys<'languages'>>;
    const versions = this.searchForm.languages.get('versions') as FormEntity<EntityControl<Versions>, Versions>;

    // patch everything
    this.searchForm.patchValue(search);

    // ensure FromList are also patched
    this.searchForm.genres.patchAllValue(search?.genres);
    this.searchForm.originCountries.patchAllValue(search?.originCountries);
    languages.patchAllValue(search?.languages);
    versions.patchValue(search?.versions);
    this.searchForm.minReleaseYear.patchValue(search?.minReleaseYear);
    this.searchForm.runningTime.patchValue(search?.runningTime);
  }

  activeUnactiveButtons() {
    const dataStorage = localStorage.getItem(`${this.app}-Library`);
    const currentRouteParams = this.route.snapshot.queryParams.formValue;
    if (dataStorage) this.disabledLoad = false;
    if (dataStorage === currentRouteParams) this.activeSave = true, this.enabledSave = true;
    else this.activeSave = false;
  }

  save() {
    this.disabledLoad = false;
    const routeParams = decodeUrl(this.route);
    localStorage.setItem(`${this.app}-Library`, JSON.stringify(routeParams));
    this.activeUnactiveButtons();
  }

  load() {
    const dataStorage = localStorage.getItem(`${this.app}-Library`);
    const parseData = JSON.parse(dataStorage);
    parseData.avails.duration.from = new Date(parseData.avails.duration.from);
    parseData.avails.duration.to = new Date(parseData.avails.duration.to);
    this.availsForm.patchValue(parseData.avails);
    this.patchSearchValues(parseData.search);
  }
}
