// Angular
import { switchMap, tap } from 'rxjs';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';

// Blockframes
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { OrganizationService } from '@blockframes/organization/service';
import { MovieService, fromOrgAndAccessible } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';


@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  public titles$ = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.movieService.valueChanges(fromOrgAndAccessible(id, this.app))),
    tap(titles => {
      titles.length
        ? this.dynTitle.setPageTitle('Dashboard')
        : this.dynTitle.setPageTitle('Dashboard', 'Empty');
    })
  );

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    @Inject(APP) private app: App,
  ) { }
}
