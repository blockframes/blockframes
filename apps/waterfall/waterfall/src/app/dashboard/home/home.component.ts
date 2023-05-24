// Angular
import { combineLatest, map, switchMap, tap } from 'rxjs';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';

// Blockframes
import { App } from '@blockframes/model';
import { APP } from '@blockframes/utils/routes/utils';
import { OrganizationService } from '@blockframes/organization/service';
import { MovieService, fromOrgAndAccessible } from '@blockframes/movie/service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { WaterfallService, fromOrg } from '@blockframes/waterfall/waterfall.service';

@Component({
  selector: 'dashboard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {

  private _waterfalls$ = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.waterfallService.valueChanges(fromOrg(id))),
    switchMap(waterfalls => this.movieService.valueChanges(waterfalls.map(w => w.id))),
  );

  private _titles$ = this.orgService.currentOrg$.pipe(
    switchMap(({ id }) => this.movieService.valueChanges(fromOrgAndAccessible(id, this.app))),
  );

  public titles$ = combineLatest([this._waterfalls$, this._titles$]).pipe(
    map(([waterfalls, movies]) => waterfalls.reduce((acc, b) => {
      if (!acc.some(a => a.id === b.id)) acc = [...acc, b];
      return acc;
    }, [...movies])),
    tap(titles => {
      titles.length
        ? this.dynTitle.setPageTitle('Dashboard')
        : this.dynTitle.setPageTitle('Dashboard', 'Empty');
    })
  );

  constructor(
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private orgService: OrganizationService,
    private dynTitle: DynamicTitleService,
    @Inject(APP) private app: App,
  ) { }
}
