// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { DashboardTitleShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-view-aditional',
  templateUrl: './additional.component.html',
  styleUrls: ['./additional.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieViewAdditionalComponent {

  public form = this.shell.getForm('movie');

  constructor(
    private dynTitle: DynamicTitleService,
    private shell: DashboardTitleShellComponent
  ) {
    this.shell.movie.then(movie => {
      const titleName = movie?.title?.international || 'No title';
      this.dynTitle.setPageTitle(titleName, 'Additional Information');
    });
  }
}
