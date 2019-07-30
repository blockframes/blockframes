import { EntityControl, FormEntity } from '@blockframes/utils';
import { FormArray, FormBuilder } from '@angular/forms';
import { MovieMainForm } from './main/main.form';
import { MoviePromotionalElementsForm } from './promotional-elements/promotional-elements.form';
import { MoviePromotionalDescriptionForm } from './promotional-description/promotional-description.form';
import { MovieStoryForm } from './story/story.form';
import { MovieSalesCastForm } from './sales-cast/sales-cast.form';
import { Movie } from '../+state';


function createMovieControls(movie: Movie) {

  return {
    main: new MovieMainForm(movie.main),
    promotionalElements: new MoviePromotionalElementsForm(movie.promotionalElements),
    promotionalDescription: new MoviePromotionalDescriptionForm(movie.promotionalDescription),
    story: new MovieStoryForm(movie.story),
    salesCast: new MovieSalesCastForm(movie.salesCast),
  }
}

type MovieControl = ReturnType<typeof createMovieControls>

export class MovieForm extends FormEntity<Partial<Movie>, MovieControl> {
  protected builder : FormBuilder;
  constructor(movie: Movie) {
    super(createMovieControls(movie));
    this.builder = new FormBuilder();
  }

  reset(value?: EntityControl<Movie>, options?: {
      onlySelf?: boolean;
      emitEvent?: boolean;
  }): void {
    super.reset(value, options);
    this.clearFormArrays();
  }

  /*
  * Clear controls that are FormArrays because form.reset() only set values to null.
  * For more information @see: https://github.com/angular/angular/issues/31110
  */
  protected clearFormArrays() {
    Object.keys(this.controls).forEach((key: string) => {
      const abstractControl = this.controls[key];
      if (abstractControl instanceof FormArray) {
        abstractControl.clear();
      }
    });
  }
}
