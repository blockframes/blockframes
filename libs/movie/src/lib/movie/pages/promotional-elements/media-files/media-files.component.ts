import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../../shell/shell.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'movie-form-media-files',
  templateUrl: './media-files.component.html',
  styleUrls: ['./media-files.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaFilesComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  get promotional() {
    return this.form.get('promotional');
  }

  public getPath(filePath: 'presentation_deck' | 'scenario' | 'moodboard') {
    const { movieId } = this.route.snapshot.params;
    return `movies/${movieId}/promotional.${filePath}`;
  }

}
