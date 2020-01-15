import { MoviePromotionalElements, PromotionalElement, createMoviePromotionalElements, createPromotionalElement } from '../../+state';
import { FormEntity, FormList, urlValidators } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { PROMOTIONAL_ELEMENT_TYPES  } from '@blockframes/movie/movie/static-model/staticModels';

function createPromotionalElementControl(promotionalElement?: Partial<PromotionalElement>) {
  const { label, size, ratio, media, language, country } = createPromotionalElement(promotionalElement);
  return {
    label: new FormControl(label),
    size: new FormControl(size),
    ratio: new FormControl(ratio),
    media: new FormControl(media.url, urlValidators),
    language: new FormControl(language),
    country: new FormControl(country),
  }
}

type PromotionalElementControl = ReturnType<typeof createPromotionalElementControl>;

export class MoviePromotionalElementForm extends FormEntity<PromotionalElementControl> {
  constructor(promotionalElement?: Partial<PromotionalElement>) {
    super(createPromotionalElementControl(promotionalElement));
  }
}

function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotionalElements(promotionalElements);
  return {
    trailer: FormList.factory(entity.trailer),
    banner: new MoviePromotionalElementForm() ,
    poster: FormList.factory(entity.poster),
    still_photo: FormList.factory(entity.still_photo),
    presentation_deck: new MoviePromotionalElementForm() ,
    scenario: new MoviePromotionalElementForm() ,
    promo_reel_link: new MoviePromotionalElementForm() ,
    screener_link: new MoviePromotionalElementForm() ,
    trailer_link: new MoviePromotionalElementForm() ,
    teaser_link: new MoviePromotionalElementForm() ,
  }
}

type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }

  public addPromotionalElement(type: PROMOTIONAL_ELEMENT_TYPES): void {	
    const promotionalElement = new MoviePromotionalElementForm();	
    this.get(type).push(promotionalElement);	
  }	

  public removePromotionalElement(type: PROMOTIONAL_ELEMENT_TYPES, i: number): void {	
    this.get(type).removeAt(i);	
  }	

}
