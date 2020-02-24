import { MoviePromotionalElements, PromotionalElement, createMoviePromotionalElements, createPromotionalElement } from '../../+state';
import { FormEntity, FormList, ImgRef, createImgRef } from '@blockframes/utils';
import { FormControl } from '@angular/forms';

function createImgRefForm(reference?: Partial<ImgRef>) {
  const { url, ref, originalRef, originalFileName } = createImgRef(reference);
  return {
    url: new FormControl(url),
    ref: new FormControl(ref),
    originalRef: new FormControl(originalRef),
    originalFileName: new FormControl(originalFileName),
  }
}

// Promotional Element LINK

function createPromotionalElementLinkControl(promotionalElement?: Partial<PromotionalElement>) {
  const { label, size, ratio, media, language, country } = createPromotionalElement(promotionalElement);
  return {
    label: new FormControl(label),
    size: new FormControl(size),
    ratio: new FormControl(ratio),
    media: new FormEntity(createImgRefForm(media)),
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
    media: new FormControl(media),
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

type MoviePromotionalElementsListKey = ExtractFormListKeys<MoviePromotionalElementsControl>

// Extract the keys that return a FormList
type ExtractFormListKeys<C> = {
  [K in keyof C]: C[K] extends FormList<infer I> ? K : never
}[keyof C]

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }
}
