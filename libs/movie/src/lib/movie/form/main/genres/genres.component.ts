import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieMainForm } from '../main.form';
import { default as staticModel } from '../../../static-model/staticModels';

@Component({
  selector: 'movie-form-genre',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreComponent {

  @Input() form: MovieMainForm;
  genres = staticModel.GENRES;

  get genresForm() {
    return this.form.get('genres');
  }

  // get customGenreForm() {
  //   return this.form.get('customGenres');
  // }
}
