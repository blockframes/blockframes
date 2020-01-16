import { MoviePromotionalElements, PromotionalElement, createMoviePromotionalElements, createPromotionalElement } from '../../+state';
import { FormEntity, FormList, urlValidators } from '@blockframes/utils';
import { FormControl } from '@angular/forms';


function createPromotionalElementControl(promotionalElement?: Partial<PromotionalElement>) {
  const { label, type, size, ratio, media, language, country } = createPromotionalElement(promotionalElement);
  return {
    label: new FormControl(label),
    type: new FormControl(type),
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
    images: FormList.factory(entity.images),
    promotionalElements: FormList.factory(entity.promotionalElements, el => new MoviePromotionalElementForm(el)),
  }
}

type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

export class MoviePromotionalElementsForm extends FormEntity<MoviePromotionalElementsControl>{
  constructor(promotionalElements?: MoviePromotionalElements) {
    super(createMoviePromotionalElementsControls(promotionalElements));
  }

  get images() {
    return this.get('images');
  }

  get promotionalElements() {
    return this.get('promotionalElements');
  }

  public setImage(image: string, index: number): void {
    this.images.controls[index].setValue(image);
  }

  public addImage(): void {
    this.images.push(new FormControl());
  }

  public addPromotionalElement(): void {
    const promotionalElement = new MoviePromotionalElementForm();
    this.promotionalElements.push(promotionalElement);
  }

  public removePromotionalElement(i: number): void {
    this.promotionalElements.removeAt(i);
  }

  public removeImage(i: number): void {
    this.images.removeAt(i);
  }

}
