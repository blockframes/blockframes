import { Component, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Organization } from '@blockframes/organization/+state';
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap, tap, throttleTime } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm, createOrganizationSearch, OrganizationSearch } from '@blockframes/organization/forms/search.form';
import { ActivatedRoute, Router } from '@angular/router'
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder'
@Component({
  selector: 'catalog-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  @HostBinding('@scaleOut') animation = true;

  public orgs$: Observable<Organization[]>;

  private orgResultsState = new BehaviorSubject<Organization[]>(null);

  public searchForm = new OrganizationSearchForm('catalog');

  public nbHits: number;
  public hitsViewed = 0;

  private subs: Subscription[] = [];
  private loadMoreToggle: boolean;
  private lastPage: boolean;
  private currentRoute: string;

  constructor(
    private service: OrganizationService,
    private dynTitle: DynamicTitleService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'All');
    this.orgs$ = this.orgResultsState.asObservable();
    const search = createOrganizationSearch({ appModule: ['dashboard'] });
    const decodedData = decodeUrl<OrganizationSearch>(this.route);
    this.searchForm.setValue({
      ...search,
      country: '',
      ...decodedData
    });
    const sub = this.searchForm.valueChanges.pipe(
      startWith(this.searchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.searchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      map(results => results.map(org => org.objectID)),
      switchMap(ids => ids.length ? this.service.valueChanges(ids) : of([])),
    ).subscribe(orgs => {
      if (this.loadMoreToggle) {
        this.orgResultsState.next(this.orgResultsState.value.concat(orgs))
        this.loadMoreToggle = false;
      } else {
        this.orgResultsState.next(orgs);
      }
      /* hitsViewed is just the current state of displayed orgs, this information is important for comparing
      the overall possible results which is represented by nbHits.
      If nbHits and hitsViewed are the same, we know that we are on the last page from the algolia index.
      So when the next valueChange is happening we need to reset everything and start from beginning  */
      this.hitsViewed = this.orgResultsState.value.length
      if (this.lastPage && this.searchForm.page.value !== 0) {
        this.hitsViewed = 0;
        this.searchForm.page.setValue(0);
      }
      this.lastPage = this.hitsViewed === this.nbHits;
    });

    const subSearchUrl = this.searchForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(({ country, query }) => {
      encodeUrl<Partial<OrganizationSearch>>(this.router, this.route, { country, query, });
    });

    this.subs.push(sub, subSearchUrl);
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
