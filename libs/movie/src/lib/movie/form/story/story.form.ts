import { createMovie, Movie } from '../../+state';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { Validators, FormControl } from '@angular/forms';

function createMovieStoryControls(story?: Partial<Movie>) {
  const entity = createMovie(story);
  return {
    logline:  new FormControl(entity.logline, [Validators.maxLength(180)]),
    synopsis: new FormControl(entity.synopsis, [Validators.required, Validators.maxLength(1000)]),
  }
}

export type MovieStoryControl = ReturnType<typeof createMovieStoryControls>

export class MovieStoryForm extends FormEntity<MovieStoryControl>{

  constructor(story?: Movie) {
    super(createMovieStoryControls(story));
  }

  get logline() {
    return this.get('logline');
  }

  get synopsis() {
    return this.get('synopsis');
  }
}
