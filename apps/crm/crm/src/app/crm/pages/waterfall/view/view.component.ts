import { ActivatedRoute } from '@angular/router';
import { pluck, switchMap } from 'rxjs/operators';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { RouteDescription } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';

@Component({
  selector: 'crm-waterfall-view',
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
      path: 'waterfall',
      label: 'Waterfall',
    },
    {
      path: 'rightholders',
      label: 'Right Holders',
    },
    {
      path: 'documents',
      label: 'Documents'
    },

    {
      path: 'contracts',
      label: '1 - Contracts',
    },
    {
      path: 'sources',
      label: '2 - Sources',
    },
    {
      path: 'rights',
      label: '3 - Rights',
    },
    {
      path: 'statements',
      label: '4 - Statements',
    },
    {
      path: 'incomes',
      label: 'Incomes',
    },
    {
      path: 'expenses',
      label: 'Expenses',
    },
    {
      path: 'sales',
      label: 'World Sales',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
  ) { }

}
