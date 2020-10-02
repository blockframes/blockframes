import { Component, ChangeDetectionStrategy, HostBinding, OnInit } from '@angular/core';
import { OrganizationService } from '@blockframes/organization/+state/organization.service';
import { scaleOut } from '@blockframes/utils/animations/fade';
import { BehaviorSubject, Observable } from 'rxjs';
import { Organization } from '@blockframes/organization/+state';
import { map } from 'rxjs/operators';
import { centralOrgID } from '@env';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { OrganizationSearchForm } from '@blockframes/organization/forms/search.form';

@Component({
  selector: 'financiers-organization-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  animations: [scaleOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  @HostBinding('@scaleOut') animation = true;
  orgs$: Observable<Organization[]>;
  
  private organizationSearchResultsState = new BehaviorSubject<Organization[]>([]);

  public organizationSearchForm = new OrganizationSearchForm()

  public nbHits: number;
  public hitsViewed = 0;

  constructor(
    private service: OrganizationService,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Sales Agent', 'All');
    this.orgs$ = this.service
      .valueChanges(ref => ref
        .where('appAccess.financiers.dashboard', '==', true)
        .where('status', '==', 'accepted'))
      .pipe(map(orgs => orgs.filter((org: Organization) => org.id !== centralOrgID && org.movieIds.length)));
  }

  /*  clear() {
     const initial = createMovieSearch({ appAccess: ['catalog'], storeConfig: ['accepted'] });
     this.filterForm.reset(initial);
     this.cdr.markForCheck();
   }
 
   async loadMore() {
     this.setScrollOffset();
     this.filterForm.page.setValue(this.filterForm.page.value + 1);
     await this.filterForm.search();
   }
 
   setScrollOffset() {
     this.scrollOffsetTop = this.scrollable.measureScrollOffset('top');
   }
 
   scrollToScrollOffset() {
     this.scrollable.scrollTo({ top: this.scrollOffsetTop });
   } */
}
