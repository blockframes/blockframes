
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MovieFormShellComponent } from '../shell/shell.component';
import { FileMetaData } from '@blockframes/media/+state/media.firestore';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaFilesComponent {
  form = this.shell.getForm('movie');

  movieId = this.route.snapshot.params.movieId;

  uploads: Record<string, { storagePath: string, metadata: FileMetaData }> = {
    presentationDeck: {
      storagePath: `public/movies/${this.movieId}/presentationDeck`,
      metadata: {
        privacy: 'public',
        collection: 'movies',
        docId: this.movieId,
        field: 'promotional.presentation_deck.storagePath',
        uid: '',
      }
    }
  }

  constructor(
    private shell: MovieFormShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle('Files');
  }

  get promotional() {
    return this.form.get('promotional');
  }

  public getPath(filePath: 'presentation_deck' | 'scenario' | 'moodboard') {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.${filePath}/`;
  }

}
