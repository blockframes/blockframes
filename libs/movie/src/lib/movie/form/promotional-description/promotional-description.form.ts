import { FormEntity, FormList } from '@blockframes/utils/form/forms';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { Movie, createMovie } from '@blockframes/movie/+state';

function createMoviePromotionalDescriptionControls(promotionalDescription?: Partial<Movie>) {
  const entity = createMovie(promotionalDescription);
  return {
    keywords: FormList.factory(entity.keywords),
    keyAssets: new FormControl(entity.keyAssets, [Validators.maxLength(750)])
  }
}

export type MoviePromotionalDescriptionControl = ReturnType<typeof createMoviePromotionalDescriptionControls>

export class MoviePromotionalDescriptionForm extends FormEntity<MoviePromotionalDescriptionControl>{
  constructor(promotionalDescription?: Movie) {
    super(createMoviePromotionalDescriptionControls(promotionalDescription));
  }

  get keywords() {
    return this.get('keywords');
  }

  get keyAssets() {
    return this.get('keyAssets');
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
