// Angular
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-media-notes',
  templateUrl: 'notes.component.html',
  styleUrls: ['./notes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaNotesComponent {
  form = this.shell.getForm('movie');

  roles = ['producer', 'director', 'other'];

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  public getPath() {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.notes/`;
  }
}