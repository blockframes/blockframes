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
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip, shareReplay,  map } from 'rxjs/operators';

import { SearchResponse } from '@algolia/client-search';

import { centralOrgId } from '@env';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { toDate } from '@blockframes/utils/helpers';
import { AlgoliaMovie } from '@blockframes/utils/algolia';
import { Territory } from '@blockframes/utils/static-model';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Media, StoreStatus } from '@blockframes/utils/static-model/types';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { AvailsFilter, isMovieAvailable } from '@blockframes/contract/avails/avails';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { Bucket, BucketService, createBucket } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { BucketContract, createBucketContract, createBucketTerm } from '@blockframes/contract/bucket/+state/bucket.model';


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
  public availsForm = new AvailsForm({}, ['duration', 'territories'])

  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;

  private parentTerms: Record<string, Term<Date>[]> = {};

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private contractService: ContractService,
    private termService: TermService,
    private snackbar: MatSnackBar,
    private bucketService: BucketService,
    private orgQuery: OrganizationQuery,
    private router: Router,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }


  async ngOnInit() {
    this.searchForm.hitsPerPage.setValue(1000);

    const queries$ = combineLatest([
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
        const saleTermIds = sales.map(sale => sale.termIds).flat();
        const termIds = [...mandateTermIds, ...saleTermIds];

        return this.termService.valueChanges(termIds).pipe(map(terms => [ mandates, sales, terms ]));
      }),
      startWith([ [], [], [] ]),
    );

    const {
      search,
      avails = {}
    } = decodeUrl(this.route);
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
      queries$,
    ]).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

    this.sub = search$.pipe(
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

    this.movies$ = search$.pipe(
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(async ([_, availsValue, bucketValue, queries]) => [await this.searchForm.search(true), availsValue, bucketValue, queries]),
    ).pipe(
      map(([movies, availsValue, bucketValue, [ mandates, sales, terms ]]: [SearchResponse<Movie>, AvailsFilter, Bucket, [ Mandate[], Sale[], Term[] ] ]) => {
        if (this.availsForm.valid) {
          return movies.hits.filter(movie => isMovieAvailable(movie.objectID, availsValue, bucketValue, mandates, sales, terms));
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
    const bucket = await this.bucketService.getActive();
    if (bucket) {
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
    this.sub.unsubscribe();
  }
}
