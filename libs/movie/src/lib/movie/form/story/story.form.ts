import { MovieStory } from '../../+state';
import { FormEntity, FormField } from '@blockframes/utils';
import { Validators } from '@angular/forms';

function createMovieStoryControls(story: MovieStory) {
  return {
    logline:  new FormField<string>(story.logline, [Validators.maxLength(180)]), 
    synopsis: new FormField<string>(story.synopsis, [Validators.maxLength(500)]), 
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