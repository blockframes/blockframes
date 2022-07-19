import { Component, ChangeDetectionStrategy, HostBinding, OnDestroy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { Organization } from '@blockframes/model';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm, createOrganizationSearch } from '@blockframes/organization/forms/search.form';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'festival-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnDestroy {

  @HostBinding('@scaleOut') animation = true;

  public orgs$: Observable<Organization[]>;

  private orgResultsState = new BehaviorSubject<Organization[]>(null);

  public searchForm = new OrganizationSearchForm('festival');

  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;
  private loadMoreToggle: boolean;
  private lastPage: boolean;

  constructor(
    private service: OrganizationService,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Buyer List');
    this.orgs$ = this.orgResultsState.asObservable();
    const search = createOrganizationSearch({ appModule: ['marketplace', '-dashboard'], hasAcceptedMovies: false });
    this.searchForm.setValue({ ...search, countries: [] });
    this.sub = this.searchForm.valueChanges.pipe(
      startWith(this.searchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.searchForm.search()),
      pluck('hits'),
      map(results => results.map(org => org.objectID)),
      switchMap(ids => ids.length ? this.service.valueChanges(ids) : of([])),
    ).subscribe((orgs: Organization[]) => {
      const filteredOrgs = orgs.filter(org => org.appAccess.festival.dashboard === false);
      this.nbHits = filteredOrgs.length;
      if (this.loadMoreToggle) {
        this.orgResultsState.next(this.orgResultsState.value.concat(orgs));
        this.loadMoreToggle = false;
      } else {
        this.orgResultsState.next(filteredOrgs);
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
