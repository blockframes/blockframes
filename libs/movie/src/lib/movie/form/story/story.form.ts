import { MovieStory, createMovieStory } from '../../+state';
import { FormEntity } from '@blockframes/utils';
import { Validators, FormControl } from '@angular/forms';

function createMovieStoryControls(story?: Partial<MovieStory>) {
  const entity = createMovieStory(story);
  return {
    logline:  new FormControl(entity.logline, [Validators.maxLength(180)]),
    synopsis: new FormControl(entity.synopsis, [Validators.required, Validators.maxLength(1000)]),
  }
}

export type MovieStoryControl = ReturnType<typeof createMovieStoryControls>

export class MovieStoryForm extends FormEntity<MovieStoryControl>{

  constructor(story?: MovieStory) {
    super(createMovieStoryControls(story));
  }

  get logline() {
    return this.get('logline');
  }

  get synopsis() {
    return this.get('synopsis');
  }
}
