import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { routeAnimation } from '@blockframes/utils/animations/router-animations';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: '[routes] title-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  animations: [routeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTitleShellComponent {
  public routerData$ = this.routerQuery.selectData('animation');
  @Input() routes;
  @Input() form = new MovieForm(this.query.getActive());

  constructor(private query: MovieQuery, private routerQuery: RouterQuery) {}

}
