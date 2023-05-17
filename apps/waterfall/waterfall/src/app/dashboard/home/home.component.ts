// Angular
import { switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';

// Blockframes
import { APP } from '@blockframes/utils/routes/utils';
import { sorts } from '@blockframes/ui/list/table/sorts';
import { filters } from '@blockframes/ui/list/table/filters';
import { App, Movie, hasAppStatus } from '@blockframes/model';
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

  public sorts = sorts;
  public filters = filters;

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
    private router: Router,
    @Inject(APP) public app: App,
  ) { }

  goToEdit(movie: Movie) {
    this.router.navigate([`/c/o/dashboard/title/${movie.id}`]);
  }
}
