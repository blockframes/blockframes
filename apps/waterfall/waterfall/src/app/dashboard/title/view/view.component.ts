
import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouteDescription } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';


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

  navLinks: RouteDescription[] = [
    {
      path: 'dashboard',
      label: 'Dashboard'
    },
    {
      path: 'statements',
      label: 'Statements'
    },
    {
      path: 'documents',
      label: 'Documents'
    },
    {
      path: 'waterfall',
      label: 'Waterfall',
    },
    {
      path: 'charts',
      label: 'Charts',
    },
    {
      path: 'avails',
      label: 'World Sales',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
  ) { }

}
