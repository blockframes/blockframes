// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewArtisticComponent {

  public form = this.shell.getForm('movie');

  constructor(
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) {
    this.shell.movie.then(movie => {
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(titleName, 'Artistic Information');
    });
  }
}
