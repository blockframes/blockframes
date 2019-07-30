import { MoviePromotionalDescription } from '../../+state';
import { FormEntity } from '@blockframes/utils';
import { FormArray, FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';

/* @todo #643
FormArray => FormList
*/
function createMoviePromotionalDescriptionControls() {

  return {
    keywords: new FormArray([]),
    keyAssets: new FormArray([]),
  }
}

type MoviePromotionalDescriptionControl = ReturnType<typeof createMoviePromotionalDescriptionControls>

export class MoviePromotionalDescriptionForm extends FormEntity<Partial<MoviePromotionalDescription>, MoviePromotionalDescriptionControl>{
  constructor() {
    super(createMoviePromotionalDescriptionControls());
  }

  get keywords() {
    return this.get('keywords') as FormArray;
  }

  public populate(moviePromotional: MoviePromotionalDescription) {

    if (moviePromotional.keywords && moviePromotional.keywords.length) {
      moviePromotional.keywords.forEach((keyword) => {
        this.keywords.push(new FormControl(keyword))
      })
    }

  }

  public addChip(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add keyword
    if ((value || '').trim()) {
      this.keywords.push(new FormControl(value.trim()));
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  //@todo #643 factorize 
  public removeKeyword(i: number): void {
    this.get('keywords').removeAt(i);
  }
}