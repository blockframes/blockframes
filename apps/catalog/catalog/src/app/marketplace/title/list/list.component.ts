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
import { Observable, Subscription, combineLatest } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip, shareReplay, map } from 'rxjs/operators';

// Blockframes
import { centralOrgId } from '@env';
import { AlgoliaMovie } from '@blockframes/utils/algolia';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { Term, StoreStatus, Mandate, Sale, Bucket } from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketService } from '@blockframes/contract/bucket/+state';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService } from '@blockframes/contract/contract/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AvailsFilter, filterContractsByTitle, availableTitle, FullMandate, getMandateTerms } from '@blockframes/contract/avails/avails';

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
    private pdfService: PdfService
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

    if (avails.duration?.from) avails.duration.from = new Date(avails.duration.from);
    if (avails.duration?.to) avails.duration.to = new Date(avails.duration.to);

    // patch everything
    this.searchForm.patchValue(search);

    // ensure FromList are also patched
    this.searchForm.genres.patchAllValue(search?.genres);
    this.searchForm.originCountries.patchAllValue(search?.originCountries);

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
        release: search.release
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
    console.log(this.availsForm.invalid)

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
}
