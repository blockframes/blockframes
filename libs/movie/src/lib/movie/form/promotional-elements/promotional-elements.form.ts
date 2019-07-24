import { MoviePromotionalElements } from '../../+state';
import { FormEntity } from '@blockframes/utils';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';

/* @todo #643
FormArray => FormList
*/
function createMoviePromotionalElementsControls() {

  return {
    images: new FormArray([]),
    promotionalElements: new FormArray([]),
  }
}

type MoviePromotionalElementsControl = ReturnType<typeof createMoviePromotionalElementsControls>

export class MoviePromotionalElementsForm extends FormEntity<Partial<MoviePromotionalElements>, MoviePromotionalElementsControl>{
  protected builder : FormBuilder; //@todo #643 no more builder group
  constructor() {
    super(createMoviePromotionalElementsControls());
    this.builder = new FormBuilder;
  }

  get images() {
    return this.get('images') as FormArray;
  }

  get promotionalElements() {
    return this.get('promotionalElements') as FormArray;
  }

  public populate(moviePromotional: MoviePromotionalElements) {

    if (moviePromotional.images && moviePromotional.images.length) {
      moviePromotional.images.forEach((image) => {
        this.images.push(new FormControl(image));
      })
    }

    if (moviePromotional.promotionalElements && moviePromotional.promotionalElements.length) {
      moviePromotional.promotionalElements.forEach((element) => {
        this.promotionalElements.push(this.builder.group(element));
      })
    }

  }

  public setImage(image: string, index: number): void {
    this.images.controls[index].setValue(image);
  }

  public addImage(): void {
    this.images.push(new FormControl(''));
  }

  public addPromotionalElement(): void {
    this.promotionalElements.push(this.builder.group({ label: '', url: ''}));
  }

  //@todo #643 factorize with removeImages
  public removePromotionalElement(i: number): void {
    this.promotionalElements.removeAt(i);
  }

  public removeImage(i: number): void {
    this.images.removeAt(i);
  }

}