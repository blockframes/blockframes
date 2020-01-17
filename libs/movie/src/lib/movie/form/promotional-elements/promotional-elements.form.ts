import { MoviePromotionalElements, PromotionalElement, createMoviePromotionalElements, createPromotionalElement } from '../../+state';
import { FormEntity, FormList, urlValidators } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { PromotionalElementTypesSlug } from '@blockframes/utils/static-model/types';

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

export type PromotionalElementControl = ReturnType<typeof createPromotionalElementControl>;

export class MoviePromotionalElementForm extends FormEntity<PromotionalElementControl> {
  constructor(promotionalElement?: Partial<PromotionalElement>) {
    super(createPromotionalElementControl(promotionalElement));
  }
}

function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotionalElements(promotionalElements);
  return {
    trailer: FormList.factory(entity.trailer, el => new MoviePromotionalElementForm(el)),
    banner: new MoviePromotionalElementForm(entity.banner),
    poster: FormList.factory(entity.poster, el => new MoviePromotionalElementForm(el)),
    still_photo: FormList.factory(entity.still_photo, el => new MoviePromotionalElementForm(el)),
    presentation_deck: new MoviePromotionalElementForm(entity.presentation_deck),
    scenario: new MoviePromotionalElementForm(entity.scenario),
    promo_reel_link: new MoviePromotionalElementForm(entity.promo_reel_link),
    screener_link: new MoviePromotionalElementForm(entity.screener_link),
    trailer_link: new MoviePromotionalElementForm(entity.trailer_link),
    teaser_link: new MoviePromotionalElementForm(entity.teaser_link),
  }
}

export type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

type MoviePromotionalElementsListKey = ExtractFormListKeys<MoviePromotionalElementsControl>

// Extract the keys that return a FormList
type ExtractFormListKeys<C> = {
  [K in keyof C]: C[K] extends FormList<infer I> ? K : never
}[keyof C]

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }

  public addPromotionalElement(type: MoviePromotionalElementsListKey): void {	
    const promotionalElement = new MoviePromotionalElementForm();	
    this.get(type).push(promotionalElement);	
  }	

  public removePromotionalElement(type: MoviePromotionalElementsListKey, i: number): void {	
    this.get(type).removeAt(i);	
  }	

}
