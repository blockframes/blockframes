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
  form = this.shell.getForm('movie');

  roles = ['producer', 'director', 'other'];

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute,
    private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Notes')
  }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.notes/`;
  }
}