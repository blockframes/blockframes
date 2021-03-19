// Angular
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { Observable, BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged } from 'rxjs/operators';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { AvailsFilter, getMandateTerm, isInBucket, isSold } from '@blockframes/contract/avails/avails';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { SearchResponse } from '@algolia/client-search';
import { Bucket, BucketQuery, BucketService, createBucket } from '@blockframes/contract/bucket/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { centralOrgID } from '@env';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private movieResultsState = new BehaviorSubject<Movie[]>(null);

  public movies$: Observable<Movie[]>;

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm()

  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;

  private terms: { [movieId: string]: { mandate: Term<Date>[], sale: Term<Date>[] } } = {};


  private parentTerms: Record<string, Term<Date>> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService,
    private snackbar: MatSnackBar,
    private bucketService: BucketService,
    private bucketQuery: BucketQuery,
    private orgQuery: OrganizationQuery
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  async ngOnInit() {
    this.movies$ = this.movieResultsState.asObservable();
    this.searchForm.hitsPerPage.setValue(1000)
    const params = this.route.snapshot.queryParams;
    for (const key in params) {
      try {
        params[key].split(',').forEach(v => this.searchForm[key].add(v.trim()));
      } catch (_) {
        console.error(`Invalid parameter ${key} in URL`);
      }
    }

    // No need to await for the results
    Promise.all([
      this.getContract('mandate'),
      this.getContract('sale')
    ])

    this.sub = combineLatest([
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
      this.availsForm.valueChanges.pipe(startWith(this.availsForm.value)),
      this.bucketQuery.selectActive().pipe(startWith(undefined))
    ]).pipe(
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(async ([_, availsValue, bucketValue]) => [await this.searchForm.search(), availsValue, bucketValue]),
    ).subscribe(([movies, availsValue, bucketValue]: [SearchResponse<Movie>, AvailsFilter, Bucket]) => {
      if (this.availsForm.valid) {
        const hits = movies.hits.filter(movie => {
          const titleId = movie.objectID;
          if (!this.terms[titleId]) return false;
          const parentTerm = getMandateTerm(availsValue, this.terms[titleId].mandate);
          if (!parentTerm) return false;
          this.parentTerms[titleId] = parentTerm;
          const terms = bucketValue.contracts.find(c => c.titleId === titleId)?.terms ?? [];
          return !isSold(availsValue, this.terms[titleId].sale) && !isInBucket(availsValue, terms);
        })
        this.movieResultsState.next(hits);
      } else { // if availsForm is invalid, put all the movies from algolia
        this.movieResultsState.next(movies.hits)
      }
    })
  }

  clear() {
    const initial = createMovieSearch({ storeConfig: [this.storeStatus] });
    this.searchForm.reset(initial);
    this.cdr.markForCheck();
  }

  private async getContract(type: Contract['type']) {
    const org = type === 'mandate' ? 'buyerId' : 'sellerId';
    const contracts = await this.contractService.getValue(ref => ref.where('type', '==', type).where(org, '==', centralOrgID));
    const termIdsByTitle = {};

    for (const contract of contracts) {
      if (!termIdsByTitle[contract.titleId]) termIdsByTitle[contract.titleId] = [];
      termIdsByTitle[contract.titleId] = termIdsByTitle[contract.titleId].concat(contract.termIds);
    }

    const promises = Object.entries(termIdsByTitle).map(([titleId, termIds]) => {
      if (!this.terms[titleId]) this.terms[titleId] = { mandate: [], sale: [] };
      return this.termService.getValue(termIds).then(terms => this.terms[titleId][type] = terms);
    });
    return Promise.all(promises);
  }

  async addAvail(titleId: string) {
    if (this.availsForm.invalid) {
      this.snackbar.open('Specify the avails before adding to selection', 'close', { duration: 3000 })
      return;
    }
    // Get the parent term
    const parentTermId = this.parentTerms[titleId]?.id
    if (!parentTermId) throw new Error('no available term for this title');
    const term = this.availsForm.value;
    const orgId = this.orgQuery.getActiveId();
    const contract = { titleId, parentTermId: parentTermId, terms: [term], price: 0, orgId };

    if (!!this.bucketQuery.getActive()) {
      this.bucketService.update(orgId, (bucket) => {
        const contracts = bucket.contracts || [];
        // Check if there is already a contract that apply on the same parentTermId
        const index = contracts.findIndex(c => c.parentTermId === parentTermId);
        if (index !== -1) { // If yes, append its's terms with the new one.
          contracts[index].terms.push(term);
          return { ...bucket, contracts };
        } else {  // Else create a new contract
          return { contracts: [...contracts, contract] };
        }
      });
    } else {
      const bucket = createBucket({
        id: orgId,
        contracts: [contract]
      })
      this.bucketService.add(bucket);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
