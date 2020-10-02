import { Component, ChangeDetectionStrategy, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { Organization } from '@blockframes/organization/+state';
import { debounceTime, distinctUntilChanged, map, pluck, startWith, switchMap, tap } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm, createOrganizationSearch } from '@blockframes/organization/forms/search.form';
import { CdkScrollable } from '@angular/cdk/overlay';

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

  private scrollOffsetTop: number;

  public orgSearchForm = new OrganizationSearchForm();

  private sub: Subscription;

  public nbHits: number;
  public hitsViewed = 0;

  constructor(
    private service: OrganizationService,
    private dynTitle: DynamicTitleService,
    private scrollable: CdkScrollable
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'All');

    this.orgs$ = this.organizationSearchResultsState.asObservable();

    this.orgSearchForm.setValue(createOrganizationSearch({ appAccess: ['financiers'], appModule: ['marketplace'] }))
    this.orgSearchForm.valueChanges.subscribe(console.log)
    this.sub = this.orgSearchForm.valueChanges.pipe(
      startWith(this.orgSearchForm.value),
      distinctUntilChanged(),
      debounceTime(300),
      switchMap(() => this.orgSearchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      tap(orgs => this.hitsViewed = this.hitsViewed + orgs.length),
      map(result => result.map(org => org.objectID)),
      switchMap(ids => ids.length ? this.service.valueChanges(ids) : of([])),
      // map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))), // TODO issue #3584
      tap(orgs => this.organizationSearchResultsState.next(this.organizationSearchResultsState.value.concat(orgs))),
      tap(_ => setTimeout(() => this.scrollToScrollOffset(), 0))
    ).subscribe();
  }

  async loadMore() {
    this.setScrollOffset();
    this.orgSearchForm.page.setValue(this.orgSearchForm.page.value + 1);
    await this.orgSearchForm.search();
  }

  setScrollOffset() {
    this.scrollOffsetTop = this.scrollable.measureScrollOffset('top');
  }

  scrollToScrollOffset() {
    this.scrollable.scrollTo({ top: this.scrollOffsetTop });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
