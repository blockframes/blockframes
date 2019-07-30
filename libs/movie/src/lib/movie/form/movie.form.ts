import { EntityControl, FormEntity } from '@blockframes/utils';
import { FormArray, FormBuilder } from '@angular/forms';
import { Injectable } from '@angular/core';
import { MovieMainForm } from './main/main.form';
import { MoviePromotionalElementsForm } from './promotional-elements/promotional-elements.form';
import { MoviePromotionalDescriptionForm } from './promotional-description/promotional-description.form';
import { MovieStoryForm } from './story/story.form';
import { MovieSalesCastForm } from './sales-cast/sales-cast.form';
import { Movie } from '../+state';


function createMovieControls() {

  return {
    main: new MovieMainForm(),
    promotionalElements: new MoviePromotionalElementsForm(),
    promotionalDescription: new MoviePromotionalDescriptionForm(),
    story: new MovieStoryForm(),
    salesCast: new MovieSalesCastForm(),
  }
}

type MovieControl = ReturnType<typeof createMovieControls>

export class MovieForm extends FormEntity<Partial<Movie>, MovieControl> {
  protected builder : FormBuilder;
  constructor() {
    super(createMovieControls());
    this.builder = new FormBuilder();
  }

  public populate(movie: Movie) {
    // @todo #643 on populate, keywords, Directed By etc are filled with empty data: check if it is still the case
    if( movie.main ) { this.get('main').populate(movie.main) }
    if( movie.promotionalElements ) { this.get('promotionalElements').populate(movie.promotionalElements) }
    if( movie.promotionalDescription ) { this.get('promotionalDescription').populate(movie.promotionalDescription) }
    if( movie.story ) { this.get('story').populate(movie.story) }
    if( movie.salesCast ) { this.get('salesCast').populate(movie.salesCast) }
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
