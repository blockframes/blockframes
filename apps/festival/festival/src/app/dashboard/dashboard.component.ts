import { algolia } from '@env';

// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { OrganizationQuery } from '@blockframes/organization/organization/+state';
// RxJs
import { Observable } from 'rxjs';

@Component({
  selector: 'festival-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  searchCtrl: FormControl = new FormControl('');
  org$ = this.orgQuery.selectActive();

  ltMd$ = this.breakpointsService.ltMd;

  public movieIndex = algolia.indexNameMovies;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  constructor(
    private breakpointsService: BreakpointsService,
    private orgQuery: OrganizationQuery
  ) { }
}
