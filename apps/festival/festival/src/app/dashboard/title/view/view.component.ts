import { Component, ChangeDetectionStrategy } from '@angular/core';
import { combineLatest } from 'rxjs';
import { RouteDescription } from '@blockframes/utils/common-interfaces/navigation';
import { OrganizationService } from '@blockframes/organization/+state';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { map, pluck, startWith, switchMap, tap } from 'rxjs/operators';

@Component({
  selector: 'festival-dashboard-title-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TitleViewComponent {
  public movie$ = combineLatest([
    this.route.params.pipe(
      pluck('movieId'),
      switchMap((movieId: string) => this.movieService.valueChanges(movieId))
    ),
    this.router.events.pipe(startWith(false))
  ]).pipe(
    map(([movie]) => movie),
    tap(movie => {
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(`${titleName}`, 'Marketplace Activity');
    })
  );

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
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private orgService: OrganizationService,
    private router: Router
  ) { }

}
