import { MovieStory } from '../../+state';
import { FormEntity, StringControl } from '@blockframes/utils';
import { Validators, FormBuilder } from '@angular/forms';

/* @todo #643
FormControl => FieldControl
FormArray => FormList
FormGroup => EntityForm
*/
function createMovieStoryControls() {

  return {
    logline:  new StringControl('', false, [Validators.maxLength(180)]), 
    synopsis: new StringControl(''), //@todo #643 use lenthAValidator < 500
  }
}

type MovieStoryControl = ReturnType<typeof createMovieStoryControls>

export class MovieStoryForm extends FormEntity<Partial<MovieStory>, MovieStoryControl>{

  constructor() {
    super(createMovieStoryControls());
  }

  get logline() {
    return this.get('logline');
  }

  get synopsis() {
    return this.get('synopsis');
  }

  public populate(movieStory: MovieStory) {
    this.logline.setValue(movieStory.logline);
    this.synopsis.setValue(movieStory.synopsis);
  }


}