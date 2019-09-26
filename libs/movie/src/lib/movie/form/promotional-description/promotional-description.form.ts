import { MoviePromotionalDescription, createMoviePromotionalDescription } from '../../+state';
import { FormEntity, FormList } from '@blockframes/utils/form';
import { FormControl } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

function createMoviePromotionalDescriptionControls(promotionalDescription: Partial<MoviePromotionalDescription> = {}) {
  const entity = createMoviePromotionalDescription(promotionalDescription);
  return {
    keywords: FormList.factory(entity.keywords),
    keyAssets: FormList.factory(entity.keyAssets),
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

  public addKeyAsset(): void {
    this.keyAssets.push(new FormControl(''));
  }

  public removeKeyAsset(i: number): void {
   this.keyAssets.removeAt(i);
  }
}
