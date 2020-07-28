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

  public presentationPath = `movies/${this.movie.id}/promotional.presentation_deck.media/`;

  public scenarioPath = `movies/${this.movie.id}/promotional.scenario.media/`;

  get promotional() {
    return this.form.get('promotional');
  }

  // get the ImgRef generated from firestorage and update url of media for each path
  importPDF(imgRef, path: 'scenario' | 'presentation_deck') {
    this.form.get('promotional').get(path).get('media').patchValue(imgRef);
  }
}
