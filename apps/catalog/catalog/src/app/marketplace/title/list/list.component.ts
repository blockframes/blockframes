// Angular
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef, OnDestroy
} from '@angular/core';


// RxJs
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ActivatedRoute } from '@angular/router';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { getMandateTerm } from '@blockframes/contract/avails/avails';
import { ContractService } from '@blockframes/contract/contract/+state';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { TermService } from '@blockframes/contract/term/+state/term.service';

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

  private mandateTerms: Term<Date>[]
  private salesTerms: Term<Date>[]

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

    const mandates = await this.contractService.getValue(ref => ref.where('type', '==', 'mandate'));
    const sales = await this.contractService.getValue(ref => ref.where('type', '==', 'sale'));

    this.mandateTerms = await (await Promise.all(mandates.map(mandate => this.termService.getValue(mandate.termIds)))).flat() as Term<Date>[];
    this.salesTerms = await (await Promise.all(sales.map(sale => this.termService.getValue(sale.termIds)))).flat() as Term<Date>[];
    console.log(this.salesTerms)
    this.sub = this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.searchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
    ).subscribe(movies => {
      if (getMandateTerm(this.availsForm.value, this.mandateTerms))
        this.movieResultsState.next(movies);
    });
  }

  clear() {
    const initial = createMovieSearch({ storeConfig: [this.storeStatus] });
    this.searchForm.reset(initial);
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
