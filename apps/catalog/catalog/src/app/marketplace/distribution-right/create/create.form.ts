import { FormEntity } from '@blockframes/utils';
import {
  DistributionRight,
  createDistributionRight,
  createDistributionRightControls,
  DistributionRightControls
} from '../+state/basket.model';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import {
  TerritoriesSlug,
  TERRITORIES_SLUG,
  LanguagesSlug
} from '@blockframes/movie/movie/static-model/types';
import {
  MovieLanguageSpecification,
  createMovieLanguage,
  createLanguageControl
} from '../../movie/search/search.form';
import { MovieMain } from '@blockframes/movie';

export class DistributionRightForm extends FormEntity<DistributionRightControls> {
  constructor(distributionRight: Partial<DistributionRight> = {}) {
    const right = createDistributionRight(distributionRight);
    const controls = createDistributionRightControls(right);
    super(controls);
  }

  get territories() {
    return this.get('territories');
  }

  get languages() {
    return this.get('languages');
  }

  get medias() {
    return this.get('medias');
  }

  addTerritory(territory: TerritoriesSlug) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(territory)) {
      throw new Error(`Territory ${territory} is not part of the list`);
    }
    // Check it's not already in the form control
    const territories = this.territories.value;
    if (!territories.includes(territory)) {
      // I guess TS complains about, that territories is not an array.
      (<FormArray>this.territories).push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  removeTerritory(index: number) {
    // I guess TS complains about, that territories is not an array.
    (<FormArray>this.territories).removeAt(index);
  }

  checkMedia(mediaChecked: string) {
    // check if media is already checked by the user
    if (!this.medias.value.includes(mediaChecked)) {
      // I guess TS complains about, that territories is not an array.
      (<FormArray>this.medias).push(new FormControl(mediaChecked));
    } else if (this.medias.value.includes(mediaChecked)) {
      const uncheckMedia = this.medias.value.indexOf(mediaChecked);
      // I guess TS complains about, that territories is not an array.
      (<FormArray>this.medias).removeAt(uncheckMedia);
    } else {
      throw new Error(`Media ${mediaChecked} doesn't exist`);
    }
  }

  addLanguage(
    language: LanguagesSlug,
    movie: MovieMain,
    value: Partial<MovieLanguageSpecification> = {}
  ) {
    if (movie.languages.includes(language)) {
      value.original = true;
      (<FormGroup>this.languages).addControl(
        language,
        createLanguageControl(createMovieLanguage(value), true)
      );
    }
    (<FormGroup>this.languages).addControl(
      language,
      createLanguageControl(createMovieLanguage(value))
    );
  }

  removeLanguage(language: LanguagesSlug) {
    (<FormGroup>this.languages).removeControl(language);
    this.updateValueAndValidity();
  }
}
