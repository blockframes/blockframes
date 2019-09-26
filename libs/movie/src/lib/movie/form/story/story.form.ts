import { MovieStory, createMovieStory } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils/form';
import { Validators } from '@angular/forms';

function createMovieStoryControls(story: Partial<MovieStory> = {}) {
  const entity = createMovieStory(story);
  return {
    logline:  new FormField(entity.logline, [Validators.maxLength(180)]),
    synopsis: new FormField(entity.synopsis, [Validators.maxLength(500)]),
  }
}

type MovieStoryControl = ReturnType<typeof createMovieStoryControls>

export class MovieStoryForm extends FormEntity<Partial<MovieStory>, MovieStoryControl>{

  constructor(story: MovieStory) {
    super(createMovieStoryControls(story));
  }

  get logline() {
    return this.get('logline');
  }

  get synopsis() {
    return this.get('synopsis');
  }
}
