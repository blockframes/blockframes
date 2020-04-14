import { algolia } from '@env';

// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { OrganizationQuery } from '@blockframes/organization/organization/+state';
// RxJs
import { Observable } from 'rxjs';
import { InvitationQuery } from '@blockframes/invitation/+state';
import { NotificationQuery } from '@blockframes/notification/notification/+state';

@Component({
  selector: 'festival-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  public invitationCount$ = this.invitationQuery.selectCount(invitation => invitation.status === 'pending');
  public notificationCount$ = this.notificationQuery.selectCount();
  public searchCtrl: FormControl = new FormControl('');
  public org$ = this.orgQuery.selectActive();

  public ltMd$ = this.breakpointsService.ltMd;

  public movieIndex = algolia.indexNameMovies;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  constructor(
    private breakpointsService: BreakpointsService,
    private orgQuery: OrganizationQuery,
    private invitationQuery: InvitationQuery,
    private notificationQuery: NotificationQuery,
  ) { }
}
