// Angular
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: '[routes] title-dashboard-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardTitleShellComponent {
  @Input() routes;
  @Input() form = new MovieForm(this.query.getActive());

  constructor(
    private query: MovieQuery,
  ) {}
}
