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
import { debounceTime, switchMap, startWith, distinctUntilChanged, skip, shareReplay,  map, take } from 'rxjs/operators';

import { SearchResponse } from '@algolia/client-search';

import { centralOrgId } from '@env';

// Blockframes
import { Movie } from '@blockframes/movie/+state';
import { AlgoliaMovie } from '@blockframes/utils/algolia';
import { allOf } from '@blockframes/contract/avails/sets';
import { Territory } from '@blockframes/utils/static-model';
import { Term } from '@blockframes/contract/term/+state/term.model';
import { OrganizationQuery } from '@blockframes/organization/+state';
import { Media, StoreStatus } from '@blockframes/utils/static-model/types';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { TermService } from '@blockframes/contract/term/+state/term.service';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { ContractService, Mandate, Sale } from '@blockframes/contract/contract/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { Bucket, BucketService, createBucket } from '@blockframes/contract/bucket/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { AvailsFilter, isMovieAvailable, getParentTerms } from '@blockframes/contract/avails/avails';
import { createBucketContract, createBucketTerm } from '@blockframes/contract/bucket/+state/bucket.model';


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

  private queries$: Observable<[ Mandate[], Sale[], Term[] ]>;
  // private parentTerms: Record<string, Term<Date>[]> = {};

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
        const saleTermIds = sales.map(sale => sale.termIds).flat();
        const termIds = [...mandateTermIds, ...saleTermIds];

        return this.termService.valueChanges(termIds).pipe(map(terms => [ mandates, sales, terms ])) as Observable<[ Mandate[], Sale[], Term[] ]>;
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
      this.queries$,
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

    if (this.availsForm.invalid) {
      this.snackbar.open('Fill in avails filter to add title to your Selection.', 'close', { duration: 5000 })
      return;
    }

    const titleId = title.objectID;
    const avails = this.availsForm.value;


    // TODO ###########################

    // This can probably be replaced by the line bellow, but it return empty arrays, maybe we should use some shareReplay ???
    // const [ mandates, sales, terms ] = await this.queries$.pipe(take(1)).toPromise();

    const mandates = await this.contractService.valueChanges(ref => ref.where('type', '==', 'mandate')
      .where('buyerId', '==', centralOrgId.catalog)
      .where('status', '==', 'accepted')
    ).pipe(take(1)).toPromise() as Mandate[];

    const sales = await this.contractService.valueChanges(ref => ref.where('type', '==', 'sale')
      .where('status', '==', 'accepted')
    ).pipe(take(1)).toPromise() as Sale[];

    const mandateTermIds = mandates.map(mandate => mandate.termIds).flat();
    const saleTermIds = sales.map(sale => sale.termIds).flat();
    const termIds = [...mandateTermIds, ...saleTermIds];

    const terms = await this.termService.valueChanges(termIds).pipe(take(1)).toPromise();

    // TODO ###########################


    const parentTerms = getParentTerms(titleId, avails, mandates, terms);
    if (!parentTerms.length) {
      this.snackbar.open(`This title is not available`, 'close', { duration: 5000 });
      return;
    }

    const orgId = this.orgQuery.getActiveId();
    const bucket = await this.bucketService.getActive();

    /** New BucketContracts that the user want to add */
    const newContracts = parentTerms.map(parentTerm => {
      // keep only what's in common between avails & parentTerm
      const medias = parentTerm.medias.filter(media => avails.medias.includes(media));
      const territories = parentTerm.territories.filter(territory => avails.territories.includes(territory));

      const terms = [createBucketTerm({ ...avails, medias, territories })];
      return createBucketContract({ titleId, parentTermId: parentTerm.id, terms });
    });


    if (bucket) {
      const bucketContracts = bucket.contracts ?? [];
      for (const newContract of newContracts) {
        // Check if there is already a contract that apply on the same parentTermId
        const existingBucketContract = bucketContracts.find(c => c.parentTermId === newContract.parentTermId);

        if (!existingBucketContract) {
          bucketContracts.push(newContract);
        } else { // append its terms with the new one.

          const validTerms: AvailsFilter[] = [];
          const conflictingTerms: AvailsFilter[] = [];

          // Terms that have same duration and exclusivity needs to be merged together
          // and then added to the valid terms

          for (const existingTerm of existingBucketContract.terms) {
            if (existingTerm.exclusive === avails.exclusive
              && allOf(existingTerm.duration).equal(avails.duration)
            ) {
              conflictingTerms.push(existingTerm);
            } else {
              validTerms.push(existingTerm);
            }
          }

          if (!conflictingTerms.length) {
            existingBucketContract.terms.push(createBucketTerm(avails));

          // Merge corresponding territories and medias
          } else {

            conflictingTerms.push(avails);

            //                                                                 from term A   from term B
            //                                                                    /    \       |
            // Accumulate Medias by Territory across terms ->     'france':   [ 'TV', 'VOD', 'DVD' ]
            //                                                    'germany':  ['TV', 'VOD', 'DVD', 'Hotels']
            //                                                    'uk':       ['TV', 'VOD', 'DVD']
            // Note: instead of a media array we use a record of media -> boolean to easily avoid duplicate
            const mediasByTerritory: Record<string, Record<Media, boolean>> = {};
            for (const term of conflictingTerms) {
              for (const territory of term.territories) {
                for (const media of term.medias) {
                  mediasByTerritory[territory][media] = true;
                }
              }
            }

            // Accumulate Territories by MediaS ->                'DVD;TV;VOD':         [ 'france', 'uk' ]
            //                                                    'DVD;Hotels;TV;VOD':  [ 'germany' ]
            // Note: instead of a media array we use a record of media -> boolean to easily avoid duplicate
            const territoriesByMedias: Record<string, Record<Territory, boolean>> = {};
            for (const territory in mediasByTerritory) {
              const key = Object.keys(mediasByTerritory[territory]).sort().join(';'); // use medias array as unique key
              territoriesByMedias[key][territory] = true;
            }

            // extract Medias & Territories from the record and create terms
            for (const key in territoriesByMedias) {
              const medias = key.split(';') as Media[];
              const territories = Object.keys(territoriesByMedias[key]) as Territory[];
              const recreatedTerm: AvailsFilter = { duration: avails.duration, exclusive: avails.exclusive, medias, territories }
              validTerms.push(recreatedTerm);
            }

            existingBucketContract.terms = validTerms.map(createBucketTerm);
          }
        }
      }
      this.bucketService.update(orgId, { contracts: bucketContracts });

    } else {

      const bucket = createBucket({ id: orgId, contracts: newContracts });
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
