import { MoviePromotionalElements, PromotionalElement } from '../../+state';
import { FormEntity, FormList, UrlControl } from '@blockframes/utils';
import { FormControl } from '@angular/forms';


interface MoviePromotionalElementFormControl {
  label: FormControl,
  url: UrlControl
}

export class MoviePromotionalElementForm extends FormEntity<PromotionalElement,MoviePromotionalElementFormControl> {
  constructor(promotionalElement: PromotionalElement) {
    super({
      label: new FormControl(promotionalElement.label),
      url: new UrlControl(promotionalElement.url),
    });
  }
}

function createMoviePromotionalElementsControls(promotionalElements? : MoviePromotionalElements) {
  return {
    images: FormList.factory(promotionalElements.images || [], el => new FormControl(el)),
    promotionalElements: FormList.factory(promotionalElements.promotionalElements || [], el => new MoviePromotionalElementForm(el)),
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