import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-media-file',
  templateUrl: './media-file.component.html',
  styleUrls: ['./media-file.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMediaFileComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent, private movieQuery: MovieQuery) { }

  public movie = this.movieQuery.getActive();

  public presentationPath = `movies/${this.movie.id}/promotional.presentation_deck/`;

  public scenarioPath = `movies/${this.movie.id}/promotional.scenario/`;

  get promotional() {
    return this.form.get('promotional');
  }

}
