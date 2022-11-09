import {
  OnInit,
  OnDestroy,
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

// RxJs
import { Observable, Subscription, combineLatest, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, shareReplay, tap } from 'rxjs/operators';

// Blockframes
import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import {
  StoreStatus,
  AlgoliaMovie,
  GetKeys,
  AvailsFilter,
  FullMandate,
  getMandateTerms,
  Bucket,
  BackendSearchOptions,
} from '@blockframes/model';
import { AvailsForm } from '@blockframes/contract/avails/form/avails.form';
import { BucketService } from '@blockframes/contract/bucket/service';
import { decodeDate, decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';
import { MovieSearchForm, createMovieSearch, Versions, MovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { EntityControl, FormEntity, FormList } from '@blockframes/utils/form';
import { AlgoliaService } from '@blockframes/utils/algolia/algolia.service';
import { OrganizationService } from '@blockframes/organization/service';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy, OnInit, AfterViewInit {

  private movieResultsState = new BehaviorSubject<(AlgoliaMovie & { mandates: FullMandate[] })[]>(null);

  public movies$: Observable<(AlgoliaMovie & { mandates: FullMandate[] })[]>;
  private movieIds: string[] = [];

  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('catalog', this.storeStatus);
  public availsForm = new AvailsForm();
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;

  private subs: Subscription[] = [];
  private loadMoreToggle: boolean;
  private previousSearch: string;
  private previousAvailsSearch: string;
  private cachedAvails: Record<string, Record<string, (AlgoliaMovie & { mandates: FullMandate[] })>> = {};

  private search$: Observable<[MovieSearch, AvailsFilter, Bucket]> = combineLatest([
    this.searchForm.valueChanges.pipe(startWith(this.searchForm.value)),
    this.availsForm.value$,
    this.bucketService.active$.pipe(startWith(undefined)),
  ]).pipe(shareReplay({ refCount: true, bufferSize: 1 }));

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private bucketService: BucketService,
    private router: Router,
    private pdfService: PdfService,
    private algoliaService: AlgoliaService,
    private orgService: OrganizationService,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  async ngOnInit() {
    this.movies$ = this.movieResultsState.asObservable();

    const sub = this.search$.pipe(
      distinctUntilChanged(),
      debounceTime(500),
      tap(([_, availsValue]) => {
        const search: { search: MovieSearch, avails: AvailsFilter } = { search: { ...this.searchForm.value }, avails: availsValue }; // TODO #8992 typing here & other apps
        
        delete search.search.page;
        const currentSearch = JSON.stringify(search);

        if(this.previousSearch === currentSearch) {
          console.log('processed movies', this.movieResultsState.value.length);
        }else if (this.searchForm.page.value !== 0) {
          this.searchForm.page.setValue(0, { onlySelf: false, emitEvent: false });
          encodeUrl<MovieSearch>(this.router, this.route, this.searchForm.value);

          // TODO #8894 afficher loader si on change les filtres (sur les 3 apps)
        }

        this.previousSearch = currentSearch;

      }),
      switchMap(async ([_, availsValue]) => {

        const availsSearch = JSON.stringify(availsValue); // TODO ADD bucket value to search ?

        if(this.availsForm.valid) {
          if(this.previousAvailsSearch === availsSearch) {
            if(this.movieResultsState.value?.length){
              for(const hit of this.movieResultsState.value) {
                if(!this.cachedAvails[availsSearch][hit.objectID]) this.cachedAvails[availsSearch][hit.objectID] = hit;
              }
            }
            
          } else {
            this.cachedAvails[availsSearch] = {};
          }
        }
        this.previousAvailsSearch = availsSearch;

        const search = this.searchForm._search(true);
        const searchOptions: BackendSearchOptions = {
          app: 'catalog', // TODO #8894 
          orgId: this.orgService.org.id,
          search,
          availsFilter: this.availsForm.valid ? availsValue : undefined,
          maxHits: this.pdfService.exportLimit,
          cachedAvails : Object.keys(this.cachedAvails[availsSearch])
        }
        return this.algoliaService.backendSearch(searchOptions)
      }),
      tap(res => this.nbHits = res.nbHits),
    ).subscribe((movies) => {
      this.movieIds = movies.moviesToExport.map(m => m.objectID);
      if (this.loadMoreToggle) {
        this.movieResultsState.next(this.movieResultsState.value.concat(movies.hits));
        this.loadMoreToggle = false;
      } else {
        this.movieResultsState.next(movies.hits);
      }
      this.hitsViewed = this.movieResultsState.value.length;
    });
    this.subs.push(sub);
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus] });
    this.searchForm.reset(initial);
    this.availsForm.reset();
    this.cdr.markForCheck();
  }

  async addAvail(title: (AlgoliaMovie & { mandates: FullMandate[] })) {
    if (this.availsForm.invalid) {
      this.snackbar.open('Please fill in your Avail Search Criteria first.', 'close', { duration: 5000 })
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

  ngAfterViewInit(): void {
    const decodedData: { search: MovieSearch, avails: AvailsFilter } = decodeUrl(this.route);
    this.load(decodedData);

    const sub = this.search$.pipe(
      debounceTime(1000),
    ).subscribe(([search, avails]) => {
      encodeUrl(this.router, this.route, {
        search: { // TODO #8992 typing here & clean
          query: search.query,
          genres: search.genres,
          originCountries: search.originCountries,
          contentType: search.contentType,
          languages: search.languages,
          minReleaseYear: search.minReleaseYear > 0 ? search.minReleaseYear : undefined,
          runningTime: search.runningTime,
          page: search.page
        },
        avails, // TODO #8992 typing here
      })
    });
    this.subs.push(sub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  async export() {
    if (this.movieIds.length >= this.pdfService.exportLimit) {
      this.snackbar.open('Sorry, you can\'t have an export with that many titles.', 'close', { duration: 5000 });
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
    this.searchForm.patchValue(parsedData.search); // TODO #8894 hard reset ?

    // ensure FromList are also patched
    this.searchForm.genres.patchAllValue(parsedData.search?.genres);
    this.searchForm.originCountries.patchAllValue(parsedData.search?.originCountries);
    languages.patchAllValue(parsedData.search?.languages?.languages);
    versions.patchValue(parsedData.search?.languages?.versions);
    this.searchForm.minReleaseYear.patchValue(parsedData.search?.minReleaseYear);
    this.searchForm.runningTime.patchValue(parsedData.search?.runningTime);

    // Avails Form
    if (parsedData.avails?.duration?.from) parsedData.avails.duration.from = decodeDate(parsedData.avails.duration.from); // TODO #8992 needed decodeDate?
    if (parsedData.avails?.duration?.to) parsedData.avails.duration.to = decodeDate(parsedData.avails.duration.to);
    if (!parsedData.avails.medias) parsedData.avails.medias = [];

    this.availsForm.patchValue(parsedData.avails);
  }
}
