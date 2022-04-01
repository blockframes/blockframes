// Angular
import { Component, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';

// Blockframes
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { Movie, Organization } from '@blockframes/shared/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm, createOrganizationSearch } from '@blockframes/organization/forms/search.form';

// RxJs
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Territory } from '@blockframes/shared/model';

@Component({
  selector: 'financiers-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListComponent implements OnInit, OnDestroy {
  @HostBinding('@scaleOut') animation = true;

  public orgs$: Observable<Organization[]>;

  private orgResultsState = new BehaviorSubject<Organization[]>(null);

  public searchForm = new OrganizationSearchForm('financiers');

  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;
  private loadMoreToggle: boolean;
  private lastPage: boolean;

  constructor(private service: OrganizationService, private dynTitle: DynamicTitleService) {}

  ngOnInit() {
    this.dynTitle.setPageTitle('Partners', 'All');
    this.orgs$ = this.orgResultsState.asObservable();
    const search = createOrganizationSearch({ appModule: ['marketplace'], countries: [] });
    this.searchForm.setValue(search);
    this.sub = this.searchForm.valueChanges
      .pipe(
        startWith(this.searchForm.value),
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(() => this.searchForm.search()),
        tap(res => (this.nbHits = res.nbHits)),
        pluck('hits'),
        map(results => results.map(org => org.objectID)),
        switchMap(ids => (ids.length ? this.service.valueChanges(ids) : of([])))
      )
      .subscribe(orgs => {
        if (this.loadMoreToggle) {
          this.orgResultsState.next(this.orgResultsState.value.concat(orgs));
          this.loadMoreToggle = false;
        } else {
          this.orgResultsState.next(orgs);
        }
        /* hitsViewed is just the current state of displayed orgs, this information is important for comparing
      the overall possible results which is represented by nbHits.
      If nbHits and hitsViewed are the same, we know that we are on the last page from the algolia index.
      So when the next valueChange is happening we need to reset everything and start from beginning  */
        this.hitsViewed = this.orgResultsState.value.length;
        if (this.lastPage && this.searchForm.page.value !== 0) {
          this.hitsViewed = 0;
          this.searchForm.page.setValue(0);
        }
        this.lastPage = this.hitsViewed === this.nbHits;
      });
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
