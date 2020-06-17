import { MoviePromotionalElements, PromotionalElement, createMoviePromotionalElements, createPromotionalElement } from '../../+state';
import { FormControl } from '@angular/forms';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import { ImgRefForm } from '@blockframes/ui/media/image-reference/image-reference.form'

// Promotional Element LINK

function createPromotionalElementLinkControl(promotionalElement?: Partial<PromotionalElement>) {
  const { label, size, ratio, media, language, country } = createPromotionalElement(promotionalElement);
  return {
    label: new FormControl(label),
    size: new FormControl(size),
    ratio: new FormControl(ratio),
    media: new ImgRefForm(media),
    language: new FormControl(language),
    country: new FormControl(country),
  }
}

export type PromotionalElementLinkControl = ReturnType<typeof createPromotionalElementLinkControl>;

export class MoviePromotionalElementLinkForm extends FormEntity<PromotionalElementLinkControl> {
  constructor(promotionalElement?: Partial<PromotionalElement>) {
    super(createPromotionalElementLinkControl(promotionalElement));
  }
}

// Promotional Element IMG_REF

function createPromotionalElementRefControl(promotionalElement?: Partial<PromotionalElement>) {
  const { label, size, ratio, media, language, country } = createPromotionalElement(promotionalElement);
  return {
    label: new FormControl(label),
    size: new FormControl(size),
    ratio: new FormControl(ratio),
    media: new ImgRefForm(media),
    language: new FormControl(language),
    country: new FormControl(country),
  }
}
export type PromotionalElementRefControl = ReturnType<typeof createPromotionalElementLinkControl>;

export class MoviePromotionalElementRefForm extends FormEntity<PromotionalElementRefControl> {
  constructor(promotionalElement?: Partial<PromotionalElement>) {
    super(createPromotionalElementRefControl(promotionalElement));
  }
}

// ALL PROMOTION ELEMENTS


function createMoviePromotionalElementsControls(promotionalElements?: Partial<MoviePromotionalElements>) {
  const entity = createMoviePromotionalElements(promotionalElements);
  return {
    trailer: FormList.factory(entity.trailer, el => new MoviePromotionalElementRefForm(el)),
    banner: new MoviePromotionalElementRefForm(entity.banner),
    poster: FormList.factory(entity.poster, el => new MoviePromotionalElementRefForm(el)),
    still_photo: FormList.factory(entity.still_photo, el => new MoviePromotionalElementRefForm(el)),
    presentation_deck: new MoviePromotionalElementRefForm(entity.presentation_deck),
    scenario: new MoviePromotionalElementRefForm(entity.scenario),
    // Links
    promo_reel_link: new MoviePromotionalElementLinkForm(entity.promo_reel_link),
    screener_link: new MoviePromotionalElementLinkForm(entity.screener_link),
    trailer_link: new MoviePromotionalElementLinkForm(entity.trailer_link),
    teaser_link: new MoviePromotionalElementLinkForm(entity.teaser_link),
  }
}

export type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>


export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }
}
