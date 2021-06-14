// Angular
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef, OnDestroy, AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { Observable, BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip } from 'rxjs/operators';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Media, StoreStatus } from '@blockframes/utils/static-model/types';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { AvailsFilter, getMandateTerms, isInBucket, isSold } from '@blockframes/contract/avails/avails';
import { Contract, ContractService } from '@blockframes/contract/contract/+state';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { SearchResponse } from '@algolia/client-search';
import { Bucket, BucketQuery, BucketService, createBucket } from '@blockframes/contract/bucket/+state';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { centralOrgId } from '@env';
import { BucketContract, createBucketContract, createBucketTerm } from '@blockframes/contract/bucket/+state/bucket.model';
import { toDate } from '@blockframes/utils/helpers';
import { Territory } from '@blockframes/utils/static-model';
import { AlgoliaMovie } from '@blockframes/utils/algolia';
import { decodeUrl, encodeUrlAndNavigate } from '@blockframes/utils/form/form-state-url-encoder';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy, OnInit {

  private movieResultsState = new BehaviorSubject<Movie[]>(null);

  public movies$: Observable<Movie[]>;

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm({}, ['duration', 'territories'])

  public nbHits: number;
  public hitsViewed = 0;

  private subs: Subscription[] = [];

  private terms: { [movieId: string]: { mandate: Term<Date>[], sale: Term<Date>[] } } = {};
  private parentTerms: Record<string, Term<Date>[]> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService,
    private snackbar: MatSnackBar,
    private bucketService: BucketService,
    private bucketQuery: BucketQuery,
    private orgQuery: OrganizationQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }


  ngOnInit() {
    this.movies$ = this.movieResultsState.asObservable();
    this.searchForm.hitsPerPage.setValue(1000)

    // No need to await for the results
    Promise.all([
      this.getContract('mandate'),
      this.getContract('sale')
    ])

    const {
      search: unparsedSearch,
      avails: unparsedAvails
    } = decodeUrl(
      this.activatedRoute,
    )
    const avails: any = unparsedAvails || {}
    if (avails.duration) {
      if (avails.duration.to) {
        try{
          avails.duration.to = new Date(avails.duration.to)
        } catch(err){
          delete avails.duration.to
        }
      }
      if (avails.duration.from) {
        try{
          avails.duration.from = new Date(avails.duration.from)
        } catch(err){
          delete avails.duration.to
        }
      }
    }

    if (unparsedSearch) {
      const search: any = unparsedSearch
      if (search.query) {
        this.searchForm.query.setValue(
          search.query
        );
      }
      if (search.contentType) {
        this.searchForm.contentType.setValue(
          search.contentType
        );
      }
      if (search.genres) {
        this.searchForm.genres.patchAllValue(
          search.genres
        );
      }
      if (search.originCountries) {
        this.searchForm.originCountries.patchAllValue(
          search.originCountries
        );
      }
    }

    this.availsForm.setValue({
      ...this.availsForm.value,
      ...avails as any
    });

    const subStateUrl = combineLatest([
      this.searchForm.valueChanges.pipe(
        startWith(this.searchForm.value)
      ),
      this.availsForm.valueChanges.pipe(
        startWith(this.availsForm.value)
      ),
    ])
      .pipe(
        skip(1)
      )
      .subscribe(
        ([search, avails]) => {
          console.log({ search, avails })
          encodeUrlAndNavigate(
            this.router,
            this.activatedRoute,
            {
              search: {
                query: search.query,
                genres: search.genres,
                originCountries: search.originCountries,
                contentType: search.contentType,
              },
              avails,
            }
          )
        })

    const sub = combineLatest([
      this.searchForm.valueChanges.pipe(
        startWith(this.searchForm.value)
      ),
      this.availsForm.valueChanges.pipe(
        startWith(this.availsForm.value)
      ),
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
          const parentTerms = getMandateTerms(availsValue, this.terms[titleId].mandate);
          if (!parentTerms.length) return false;
          this.parentTerms[titleId] = parentTerms;
          const terms = bucketValue?.contracts.find(c => c.titleId === titleId)?.terms ?? [];
          return !isSold(availsValue, this.terms[titleId].sale) && !isInBucket(availsValue, terms);
        })
        this.movieResultsState.next(hits);
      } else { // if availsForm is invalid, put all the movies from algolia
        this.movieResultsState.next(movies.hits)
      }
    })

    this.subs.push(sub, subStateUrl)
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus], hitsPerPage: 1000 });
    this.searchForm.reset(initial);
    this.availsForm.reset();
    this.cdr.markForCheck();
  }

  private async getContract(type: Contract['type']) {
    const contracts = type === 'mandate'
      ? await this.contractService.getValue(ref => ref.where('type', '==', 'mandate').where('buyerId', '==', centralOrgId.catalog).where('status', '==', 'accepted'))
      : await this.contractService.getValue(ref => ref.where('type', '==', 'sale').where('status', '==', 'accepted'))
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

  addAvail(title: AlgoliaMovie) {
    const titleId = title.objectID;
    if (this.availsForm.invalid) {
      this.snackbar.open('Fill in avails filter to add title to your Selection.', 'close', { duration: 5000 })
      return;
    }
    // Get the parent term
    if (!this.parentTerms[titleId]) throw new Error('no available term for this title');
    const newTerm = this.availsForm.value;
    const newContracts: BucketContract[] = [];
    for (const parentTerm of this.parentTerms[titleId]) {
      // contract should only contain media and territories which are on the parentTerm
      newTerm.medias = parentTerm.medias.filter(media => newTerm.medias.includes(media));
      newTerm.territories = parentTerm.territories.filter(territory => newTerm.territories.includes(territory));
      const terms = [createBucketTerm(newTerm)];
      const contract = createBucketContract({ titleId, parentTermId: parentTerm.id, terms });
      newContracts.push(contract);
    }

    const orgId = this.orgQuery.getActiveId();
    if (this.bucketQuery.getActive()) {
      this.bucketService.update(orgId, bucket => {
        const contracts = bucket.contracts || [];
        for (const newContract of newContracts) {
          // Check if there is already a contract that apply on the same parentTermId
          const contract = contracts.find(c => c.parentTermId === newContract.parentTermId);
          if (contract) { // If yes, append its terms with the new one.

            // Valid terms
            const terms: AvailsFilter[] = [];
            // Terms that have same duration and exclusivity as the to-be-added term
            const conflictingTerms: AvailsFilter[] = [];

            for (const existingTerm of contract.terms) {
              if (toDate(existingTerm.duration.from).getTime() === newTerm.duration.from.getTime()
                && toDate(existingTerm.duration.to).getTime() === newTerm.duration.to.getTime()
                && existingTerm.exclusive === newTerm.exclusive) {
                conflictingTerms.push(existingTerm);
              } else {
                terms.push(existingTerm);
              }
            }

            if (conflictingTerms.length) {
              conflictingTerms.push(newTerm);

              // Countries with media
              const territoryRecord: { [territories: string]: Media[] } = {};
              for (const term of conflictingTerms) {
                for (const territory of term.territories) {
                  if (territoryRecord[territory]) {
                    // only add medias that are not in the array yet
                    const medias = term.medias.filter(media => territoryRecord[territory].every(m => m !== media))
                    territoryRecord[territory] = territoryRecord[territory].concat(medias);
                  } else {
                    territoryRecord[territory] = term.medias;
                  }
                }
              }

              // Combining unique media arrays with countries
              const mediaRecord: { [medias: string]: Territory[] } = {};
              for (const [territory, medias] of Object.entries(territoryRecord)) {
                const key = medias.sort().join(';');
                mediaRecord[key] ? mediaRecord[key].push(territory as Territory) : mediaRecord[key] = [territory as Territory];
              }

              // Create new terms
              for (const [key, territories] of Object.entries(mediaRecord)) {
                const medias = key.split(';') as Media[];
                const recreatedTerm: AvailsFilter = { duration: newTerm.duration, exclusive: newTerm.exclusive, medias, territories }
                terms.push(recreatedTerm);
              }
              contract.terms = terms.map(createBucketTerm);
            } else {
              contract.terms.push(createBucketTerm(newTerm));
            }

          } else { // Else add new contract
            contracts.push(newContract);
          }
        }
        return { ...bucket, contracts };
      })
    } else {
      const bucket = createBucket({
        id: orgId,
        contracts: newContracts
      })
      this.bucketService.add(bucket);
    }
    this.snackbar.open(`${title.title.international} was added to your Selection`, 'GO TO SELECTION', { duration: 4000 })
      .onAction()
      .subscribe(() => this.router.navigate(['/c/o/marketplace/selection']));
  }

  ngOnDestroy() {
    this.subs.forEach(
      s => s.unsubscribe()
    )
  }
}
