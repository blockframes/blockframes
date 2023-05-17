
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouteDescription } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { OrganizationService } from '@blockframes/organization/service';


@Component({
  selector: 'waterfall-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleViewComponent {
  public movie$ = this.route.params.pipe(
    pluck('movieId'),
    switchMap((movieId: string) => this.movieService.valueChanges(movieId)));

  public org$ = this.orgService.currentOrg$;

  navLinks: RouteDescription[] = [
    {
      path: 'statements',
      label: 'Statements'
    },
    {
      path: 'financing-plan',
      label: 'Financing Plan'
    },
    {
      path: 'budget',
      label: 'Budget'
    },
    {
      path: 'contacts',
      label: 'Contacts'
    },
    {
      path: 'waterfall',
      label: 'Waterfall',
    },
    {
      path: 'charts',
      label: 'Charts',
    },
  ];

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private route: ActivatedRoute
  ) { }

}
