
import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaFilesComponent {
  form = this.shell.getForm('movie');
  movieId = this.route.snapshot.params.movieId;

  constructor(
    public shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Files');
  }
}
