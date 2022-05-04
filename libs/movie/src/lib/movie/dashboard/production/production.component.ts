// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-production',
  templateUrl: './production.component.html',
  styleUrls: ['./production.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewProductionComponent {

  public form = this.shell.getForm('movie');

  constructor(
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) {
    this.shell.movie.then(movie => {
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(titleName, 'Production Information');
    })
  }
}
