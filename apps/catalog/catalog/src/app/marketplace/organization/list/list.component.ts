import { Component, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '@blockframes/organization/service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Organization, OrganizationSearch } from '@blockframes/model';
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap, tap, throttleTime } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm, createOrganizationSearch } from '@blockframes/organization/forms/search.form';
import { decodeUrl, encodeUrl } from '@blockframes/utils/form/form-state-url-encoder';

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
  private previousSearch: string;

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
    this.searchForm.hardReset({ ...search, ...decodedData });

    const sub = this.searchForm.valueChanges.pipe(
      startWith(this.searchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        const search = { ...this.searchForm.value };
        delete search.page;
        const currentSearch = JSON.stringify(search);
        if (this.previousSearch !== currentSearch && this.searchForm.page.value !== 0) {
          this.searchForm.page.setValue(0, { onlySelf: false, emitEvent: false });
        }
        this.previousSearch = currentSearch;
      }),
      switchMap(() => this.searchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      map(results => results.map(org => org.objectID)),
      switchMap(ids => ids.length ? this.service.load(ids) : of([])),
      map(orgs => orgs.filter(o => !!o))
    ).subscribe((orgs: Organization[]) => {
      if (this.loadMoreToggle) {
        this.orgResultsState.next(this.orgResultsState.value.concat(orgs));
        this.loadMoreToggle = false;
      } else {
        this.orgResultsState.next(orgs);
      }
      this.hitsViewed = this.orgResultsState.value.length;
    });

    const subSearchUrl = this.searchForm.valueChanges.pipe(
      throttleTime(1000)
    ).subscribe(({ countries, query }) => {
      encodeUrl<Partial<OrganizationSearch>>(this.router, this.route, { countries, query });
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
