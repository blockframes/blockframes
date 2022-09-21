import {
  OnInit,
  OnDestroy,
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { where } from 'firebase/firestore';

// RxJs
import { SearchResponse } from '@algolia/client-search';
import { Observable, Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip, shareReplay, map } from 'rxjs/operators';

// Blockframes
import { centralOrgId } from '@env';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { Term, StoreStatus, Mandate, Sale, Bucket, AlgoliaMovie, GetKeys } from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketService } from '@blockframes/contract/bucket/service';
import { TermService } from '@blockframes/contract/term/service';
import { decodeDate, decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService } from '@blockframes/contract/contract/service';
import { MovieSearchForm, createMovieSearch, Versions, MovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AvailsFilter, filterContractsByTitle, availableTitle, FullMandate, getMandateTerms } from '@blockframes/contract/avails/avails';
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy, OnInit {

  public movies$: Observable<(AlgoliaMovie & { mandates: FullMandate[] })[]>;
  private movieIds: string[] = [];

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm();
  public exporting = false;
  public nbHits: number;
  public hitsViewed$ = new BehaviorSubject<number>(50);

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

    const parsedData: { search: MovieSearch, avails: AvailsFilter } = decodeUrl(this.route);
    this.load(parsedData);

    const search$ = combineLatest([
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
      this.availsForm.value$,
      this.bucketService.active$.pipe(startWith(undefined)),
      this.queries$,
      this.hitsViewed$
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
        languages: search.languages,
        minReleaseYear: search.minReleaseYear > 0 ? search.minReleaseYear : undefined,
        runningTime: search.runningTime
        // TODO #8893 add page number ?
      },
      avails,
    }));
    this.subs.push(searchSub);

    this.movies$ = search$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(async ([_, availsValue, bucketValue, queries, hitsViewed]) => [await this.searchForm.search(true), availsValue, bucketValue, queries, hitsViewed]),
    ).pipe(
      map(([movies, availsValue, bucketValue, { mandates, mandateTerms, sales, saleTerms }, hitsViewed]: [SearchResponse<AlgoliaMovie>, AvailsFilter, Bucket, { mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[] }, number]) => {

        // if availsForm is invalid, put all the movies from algolia
        if (this.availsForm.invalid) {
          this.nbHits = movies.hits.length;
          this.movieIds = movies.hits.map(m => m.objectID);
          return movies.hits.map(m => ({ ...m, mandates: [] as FullMandate[] })).slice(0, hitsViewed);
        }

        if (!mandates.length) {
          this.nbHits = 0;
          this.movieIds = [];
          return [];
        }

        const results = movies.hits.map(movie => {
          const res = filterContractsByTitle(movie.objectID, mandates, mandateTerms, sales, saleTerms, bucketValue);
          const availableMandates = availableTitle(availsValue, res.mandates, res.sales, res.bucketContracts);
          return { ...movie, mandates: availableMandates };
        }).filter(m => !!m.mandates.length);

        this.nbHits = results.length;
        this.movieIds = results.map(m => m.objectID);
        return results.slice(0, hitsViewed);
      }),
    );
  }

  loadMore() {
    this.hitsViewed$.next(this.hitsViewed$.value + 50);
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

  async export() {
    if (this.movieIds.length >= this.pdfService.exportLimit) {
      this.snackbar.open('You can\'t have an export with that many titles.', 'close', { duration: 5000 });
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
    this.searchForm.patchValue(parsedData.search);

    // ensure FromList are also patched
    this.searchForm.genres.patchAllValue(parsedData.search?.genres);
    this.searchForm.originCountries.patchAllValue(parsedData.search?.originCountries);
    languages.patchAllValue(parsedData.search?.languages?.languages);
    versions.patchValue(parsedData.search?.languages?.versions);
    this.searchForm.minReleaseYear.patchValue(parsedData.search?.minReleaseYear);
    this.searchForm.runningTime.patchValue(parsedData.search?.runningTime);

    // Avails Form
    if (parsedData.avails?.duration?.from) parsedData.avails.duration.from = decodeDate(parsedData.avails.duration.from);
    if (parsedData.avails?.duration?.to) parsedData.avails.duration.to = decodeDate(parsedData.avails.duration.to);

    this.availsForm.patchValue(parsedData.avails);
  }
}
