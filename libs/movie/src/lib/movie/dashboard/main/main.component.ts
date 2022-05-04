// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewMainComponent {

  public form = this.shell.getForm('movie');

  constructor(
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) {
    this.shell.movie.then(movie => {
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(titleName, 'Main Information');
    });
  }

}
