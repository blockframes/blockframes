import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MovieMainForm } from '../main.form';
import { default as staticModel } from '@blockframes/utils/static-model/staticModels';
import { startWith, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'movie-form-genre',
  templateUrl: './genres.component.html',
  styleUrls: ['./genres.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreComponent implements OnInit {

  @Input() form: MovieMainForm;
  hasOtherGenre$: Observable<boolean>;
  genres = staticModel.GENRES;

  get genresForm() {
    return this.form.get('genres');
  }

  get customGenreForm() {
    return this.form.get('customGenres');
  }

  ngOnInit() {
    this.hasOtherGenre$ = this.genresForm.valueChanges.pipe(
      startWith(this.genresForm.value),
      map(genres => genres.includes('other'))
    )
  }
}
