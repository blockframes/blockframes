// Angular
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'movie-form-media-notes',
  templateUrl: 'notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaNotesComponent {
  movieId = this.route.snapshot.params.movieId;
  form = this.shell.getForm('movie');

  roles = ['producer', 'director', 'other'];

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute,
    private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Notes');
  }

  computeIndex(realIndex: number) {
    const nonEmptyCount = this.form.promotional.get('notes').value.reduce((acc, note) => {
      if (!!note.storagePath) return acc + 1;
      return acc;
    }, 0);

    const indexInUploaderQueue = realIndex - nonEmptyCount;
    if (indexInUploaderQueue >= 0) return indexInUploaderQueue;
    return undefined;
  }
}
