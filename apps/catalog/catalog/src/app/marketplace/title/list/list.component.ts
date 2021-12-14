// Angular
import {
  OnInit,
  OnDestroy,
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { Observable, Subscription, combineLatest } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip, shareReplay, map, take } from 'rxjs/operators';
import { SearchResponse } from '@algolia/client-search';
import { centralOrgId } from '@env';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { AlgoliaMovie } from '@blockframes/utils/algolia';
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { Bucket, BucketService } from '@blockframes/contract/bucket/+state';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';


import { getMandateTerms } from '@blockframes/contract/avails/avails';
import { AvailsFilter, filterByTitle, availableTitle } from '@blockframes/contract/avails/new-avails';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy, OnInit {

  public movies$: Observable<Movie[]>;

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm({}, ['duration', 'territories']);
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

    this.queries$ = combineLatest([
      this.contractService.valueChanges(ref => ref.where('type', '==', 'mandate')
        .where('buyerId', '==', centralOrgId.catalog)
        .where('status', '==', 'accepted')
      ),
      this.contractService.valueChanges(ref => ref.where('type', '==', 'sale')
        .where('status', '==', 'accepted')
      ),
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
      this.availsForm.valueChanges.pipe(startWith(this.availsForm.value)),
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
      map(([movies, availsValue, bucketValue, { mandates, mandateTerms, sales, saleTerms }]: [SearchResponse<Movie>, AvailsFilter, Bucket, { mandates: Mandate[], mandateTerms: Term[], sales: Sale[], saleTerms: Term[] }]) => {
        if (this.availsForm.valid) {
          if (!mandates.length) return [];
          // console.log('##################################');
          // console.log('##################################');
          // console.log('##################################');
          // console.log(availsValue);
          return movies.hits.filter(movie => {

            // console.group(movie.objectID);
            // console.log(movie);

            const { mandates: fullMandates, sales: fullSales, bucketContracts } = filterByTitle(movie.objectID, mandates, mandateTerms, sales, saleTerms, bucketValue);

            // console.log({ fullMandates, fullSales, bucketContracts });

            const isAvailable = availableTitle(availsValue, fullMandates, fullSales, bucketContracts);

            // console.log('available', isAvailable);
            // console.groupEnd();

            return isAvailable;

            // const { titleMandateTerms, titleSaleTerms } = filterByTitleId(movie.objectID, mandates, mandateTerms, sales, saleTerms);
            // TODO issue#7139 if is in bucket return false, and remove bucket from param of isMovieAvailable
            // return isMovieAvailable(movie.objectID, availsValue, bucketValue, titleMandateTerms, titleSaleTerms);
          });
        } else { // if availsForm is invalid, put all the movies from algolia
          return movies.hits;
        }
      }),
    );
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus], hitsPerPage: 1000 });
    this.searchForm.reset(initial);
    this.availsForm.reset();
    this.cdr.markForCheck();
  }

  async addAvail(title: AlgoliaMovie) {

    if (this.availsForm.invalid) {
      this.snackbar.open('Fill in avails filter to add title to your Selection.', 'close', { duration: 5000 })
      return;
    }

    const titleId = title.objectID;
    const avails = this.availsForm.value;

    const { mandateTerms } = await this.queries$.pipe(take(1)).toPromise();

    const [parentTerm] = getMandateTerms(avails, mandateTerms);
    if (!parentTerm) {
      this.snackbar.open(`This title is not available`, 'close', { duration: 5000 });
      return;
    }

    this.bucketService.addTerm(titleId, parentTerm.id, this.availsForm.value);

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
