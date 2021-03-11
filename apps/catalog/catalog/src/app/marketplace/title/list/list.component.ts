// Angular
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef, OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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
    mandateTerms: Term<Date>[]
    salesTerms: Term<Date>[]
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService
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

    this.terms.mandateTerms = await this.getAllTerms('mandate');
    this.terms.salesTerms = await this.getAllTerms('sale')

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
          const movieMandate = getMandateTerm(availsValue, this.terms.mandateTerms.filter(
            mandate => mandate.titleId === movie.objectID));
          if (movieMandate) {
            const movieSales = this.terms.salesTerms.filter(sale => sale.titleId === movie.objectID);
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

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
