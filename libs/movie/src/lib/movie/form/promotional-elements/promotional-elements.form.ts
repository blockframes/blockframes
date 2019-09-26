import { MoviePromotionalElements, PromotionalElement, createMoviePromotionalElements } from '../../+state';
import { FormEntity, FormList, UrlControl } from '@blockframes/utils/form';
import { FormControl } from '@angular/forms';


function createPromotionalElementControl(promotionalElement : Partial<PromotionalElement> = {}) {
  return {
    label: new FormControl(promotionalElement.label),
    url: new UrlControl(promotionalElement.url),
  }
}

type PromotionalElementControl = ReturnType<typeof createPromotionalElementControl>;

export class MoviePromotionalElementForm extends FormEntity<PromotionalElement,PromotionalElementControl> {
  constructor(promotionalElement: PromotionalElement) {
    super(createPromotionalElementControl(promotionalElement));
  }
}

function createMoviePromotionalElementsControls(promotionalElements : Partial<MoviePromotionalElements> = {}) {
  const entity = createMoviePromotionalElements(promotionalElements);
  return {
    images: FormList.factory(entity.images),
    promotionalElements: FormList.factory(entity.promotionalElements, el => new MoviePromotionalElementForm(el)),
  }
}

type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

export class MoviePromotionalElementsForm extends FormEntity<Partial<MoviePromotionalElements>, MoviePromotionalElementsControl>{
  constructor(promotionalElements : MoviePromotionalElements) {
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
    this.images.push(new FormControl(''));
  }

  public addPromotionalElement(): void {
    const promotionalElement = new FormEntity<PromotionalElement>({
      label: new FormControl(''),
      url: new UrlControl(''),
    });
    this.promotionalElements.push(promotionalElement);
  }

  public removePromotionalElement(i: number): void {
    this.promotionalElements.removeAt(i);
  }

  public removeImage(i: number): void {
    this.images.removeAt(i);
  }

}
