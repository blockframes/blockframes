import { EntityControl, FormEntity } from '@blockframes/utils';
import { FormArray, FormBuilder } from '@angular/forms';
import { MovieMainForm } from './main/main.form';
import { MoviePromotionalElementsForm } from './promotional-elements/promotional-elements.form';
import { MoviePromotionalDescriptionForm } from './promotional-description/promotional-description.form';
import { MovieStoryForm } from './story/story.form';
import { MovieSalesCastForm } from './sales-cast/sales-cast.form';
import { Movie, createMovie } from '../+state';
import { MovieSalesInfoForm } from './sales-info/sales-info.form';
import { MovieVersionInfoForm } from './version-info/version-info.form';


function createMovieControls(movie: Partial<Movie>) {
  const entity = createMovie(movie);
  return {
    main: new MovieMainForm(entity.main),
    promotionalElements: new MoviePromotionalElementsForm(entity.promotionalElements),
    promotionalDescription: new MoviePromotionalDescriptionForm(entity.promotionalDescription),
    story: new MovieStoryForm(entity.story),
    salesCast: new MovieSalesCastForm(entity.salesCast),
    salesInfo: new MovieSalesInfoForm(entity.salesInfo),
    versionInfo: new MovieVersionInfoForm(entity.versionInfo),
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
