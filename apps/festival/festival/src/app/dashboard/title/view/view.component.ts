import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { pluck, switchMap } from 'rxjs/operators';

@Component({
  selector: 'festival-dashboard-title-view',
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
      path: 'activity',
      label: 'Marketplace'
    },
    {
      path: 'main',
      label: 'Main'
    },
    {
      path: 'artistic',
      label: 'Artistic'
    },
    {
      path: 'production',
      label: 'Production'
    },
    {
      path: 'additional',
      label: 'Additional'
    }
  ];

  constructor(
    private movieService: MovieService,
    private route: ActivatedRoute,
    private orgService: OrganizationService,
  ) { }

}
