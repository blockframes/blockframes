// Angular
import { Component, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';

// Blockframes
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { Organization } from '@blockframes/organization/+state';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm, createOrganizationSearch } from '@blockframes/organization/forms/search.form';

// RxJs
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'financiers-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  @HostBinding('@scaleOut') animation = true;
  orgs$: Observable<Organization[]>;

  private organizationSearchResultsState = new BehaviorSubject<Organization[]>([]);

  public orgSearchForm = new OrganizationSearchForm();

  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;
  private loadMoreToggle: boolean;
  private lastPage: boolean;

  constructor(
    private service: OrganizationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'All');

    this.orgs$ = this.organizationSearchResultsState.asObservable();
    this.orgSearchForm.setValue(createOrganizationSearch({ appAccess: ['financiers'], appModule: ['marketplace'] }))
    this.sub = this.orgSearchForm.valueChanges.pipe(
      startWith(this.orgSearchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.orgSearchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      map(results => results.map(org => org.objectID)),
      switchMap(ids => ids.length ? this.service.valueChanges(ids) : of([])),
      // map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))), // TODO issue #3584
      tap(orgs => {
        if (this.loadMoreToggle) {
          this.organizationSearchResultsState.next(this.organizationSearchResultsState.value.concat(orgs))
          this.loadMoreToggle = false;
        } else {
          this.organizationSearchResultsState.next(orgs);
        }
        /* hitsViewed is just the current state of displayed orgs, this information is important for comparing
        the overall possible results which is represented by nbHits.
        If nbHits and hitsViewed are the same, we know that we are on the last page from the algolia index.
        So when the next valueChange is happening we need to reset everything and start from beginning  */
        this.hitsViewed = this.organizationSearchResultsState.value.length
        if (this.lastPage) {
          this.hitsViewed = 0;
          this.orgSearchForm.page.setValue(0);
        }
        this.lastPage = this.hitsViewed === this.nbHits;
      })
    ).subscribe();
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.orgSearchForm.page.setValue(this.orgSearchForm.page.value + 1);
    await this.orgSearchForm.search();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
