import { MoviePromotionalDescription } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material';

function createMoviePromotionalDescriptionControls(promotionalDescription: MoviePromotionalDescription) {
  return {
    keywords: FormList.factory(promotionalDescription.keywords || [], el => new FormControl(el)),
    keyAssets: FormList.factory(promotionalDescription.keyAssets || [], el => new FormControl(el)),
  }
}

type MoviePromotionalDescriptionControl = ReturnType<typeof createMoviePromotionalDescriptionControls>

export class MoviePromotionalDescriptionForm extends FormEntity<Partial<MoviePromotionalDescription>, MoviePromotionalDescriptionControl>{
  constructor(promotionalDescription: MoviePromotionalDescription) {
    super(createMoviePromotionalDescriptionControls(promotionalDescription));
  }

  get keywords() {
    return this.get('keywords');
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

  public removeKeyword(i: number): void {
    this.keywords.removeAt(i);
  }
}