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
import { AvailsFilter, getMandateTerm, isSold } from '@blockframes/contract/avails/avails';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { SearchResponse } from '@algolia/client-search';
import { BucketService } from '@blockframes/contract/bucket/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';

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

  private terms: {
    mandate: Term<Date>[],
    sales: Term<Date>[]
  } = {
      mandate: [],
      sales: []
    }


  private mandateMemo: Record<string, Term<Date>> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService,
    private snackbar: MatSnackBar,
    private bucketService: BucketService,
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

    this.terms.mandate = await this.getAllTerms('mandate');
    this.terms.sales = await this.getAllTerms('sale')

    this.sub = combineLatest([
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
      this.availsForm.valueChanges.pipe(startWith(this.availsForm.value))
    ]).pipe(
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(async ([_, availsValue]) => [await this.searchForm.search(), availsValue]),
    ).subscribe(([movies, availsValue]: [SearchResponse<Movie>, AvailsFilter]) => {
      if (this.availsForm.valid) {
        this.movieResultsState.next([])
        movies.hits.forEach(movie => {
          this.mandateMemo[movie.objectID] = getMandateTerm(availsValue, this.terms.mandate.filter(
            mandate => mandate.titleId === movie.objectID));
          if (this.mandateMemo[movie.objectID]) {
            const movieSales = this.terms.sales.filter(sale => sale.titleId === movie.objectID);
            const ongoingSales = isSold(availsValue, movieSales);
            if (!ongoingSales) {
              // Implement bucket func @TODO #5002
              const state = this.movieResultsState.getValue();
              state.push(movie)
              this.movieResultsState.next(state);
            }
          }
        })
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

  async getAllTerms(contractType: 'mandate' | 'sale'): Promise<Term<Date>[]> {
    const contracts = await this.contractService.getValue(ref => ref.where('type', '==', contractType));
    const promises = contracts.map(c => this.termService.getValue(c.termIds));
    const terms = await Promise.all(promises);
    return terms.flat() as Term<Date>[];
  }

  async addAvail(titleId: string) {
    if (this.availsForm.invalid) {
      this.snackbar.open('Specify the avails before adding to selection', 'close', { duration: 3000 })
      return;
    }
    // Get the parent term
    const mandate = await this.contractService.getValue(this.mandateMemo[titleId].contractId);
    if (!mandate) throw new Error('no available term for this title');
    const term = this.availsForm.value;
    this.bucketService.update(this.orgQuery.getActiveId(), (bucket) => {
      const contracts = bucket.contracts || [];
      // Check if there is already a contract that apply on the same parentTermId
      const index = contracts.findIndex(contract => contract.parentTermId === mandate.parentTermId);
      if (index !== -1) { // If yes, append its's terms with the new one.
        contracts[index].terms.push(term);
        return { ...bucket, contracts };
      } else {  // Else create a new contract
        const contract = { titleId, parentTermId: mandate.parentTermId, terms: [term], price: 0, orgId: this.orgQuery.getActiveId() };
        return { contracts: [...contracts, contract] };
      }
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
