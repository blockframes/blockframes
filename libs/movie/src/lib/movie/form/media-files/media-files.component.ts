
import { ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';

import { FileMetaData } from '@blockframes/media/+state/media.model';
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

  storagePaths: Record<string, string> = {
    presentationDeck: `public/movies/${this.movieId}/presentationDeck`,
    scenario: `public/movies/${this.movieId}/scenario`,
    moodboard: `public/movies/${this.movieId}/moodboard`,
  };

  metadatas: Record<string, FileMetaData> = {
    presentationDeck: {
      privacy: 'public',
      collection: 'movies',
      docId: this.movieId,
      field: 'promotional.presentation_deck',
      uid: '',
    },
    scenario: {
      privacy: 'public',
      collection: 'movies',
      docId: this.movieId,
      field: 'promotional.scenario',
      uid: '',
    },
    moodboard: {
      privacy: 'public',
      collection: 'movies',
      docId: this.movieId,
      field: 'promotional.moodboard',
      uid: '',
    },
  };

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Files');
  }


}
