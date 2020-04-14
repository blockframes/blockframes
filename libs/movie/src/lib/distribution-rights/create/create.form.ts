import { FormArray, FormGroup, FormControl, Validators } from '@angular/forms';
import {
  TerritoriesSlug,
  TERRITORIES_SLUG,
  LanguagesSlug
} from '@blockframes/utils/static-model/types';
import { MovieMain, createMovieLanguageSpecification } from '../../movie/+state/movie.model';
import { MovieLanguageSpecification } from '../../movie/+state/movie.firestore';
import { DistributionRight, createDistributionRight } from '../+state/distribution-right.model';
import { valueIsInModelValidator, numberRangeValidator } from '@blockframes/utils/form/validators/validators';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

/* ------------- */
/* CREATE OBJECT */
/* ------------- */

export function createLanguageControl(
  language: MovieLanguageSpecification,
  disableDubbed?: boolean
) {
  return {
    original: new FormControl(language.original),
    dubbed: new FormControl({ value: language.dubbed, disabled: disableDubbed }),
    subtitle: new FormControl(language.subtitle)
  };
}

function createDistributionRightControls(right: Partial<DistributionRight> = {}) {
  // Create controls for the languages
  const languageControl = Object.keys(right.assetLanguage).reduce( // @TODO better to mutate it to avoid double loop
    (acc, key) => ({
      ...acc,
      // Key is the name of the language, english, french etc.
      [key]: createLanguageControl(right.assetLanguage[key])
    }),
    {} // Initial value. No controls at the beginning
  );
  return {
    medias: new FormArray(right.licenseType.map(media => new FormControl(media)), [
      Validators.required,
      valueIsInModelValidator('MEDIAS')
    ]),
    languages: new FormGroup(languageControl, Validators.required),
    duration: new FormGroup(
      {
        from: new FormControl(right.terms.start, [Validators.required]),
        to: new FormControl(right.terms.end, [Validators.required])
      },
      [Validators.required, numberRangeValidator('from', 'to')]
    ),
    territories: new FormArray(right.territory.map(territory => new FormControl(territory)), [
      Validators.required,
      valueIsInModelValidator('TERRITORIES')
    ]),
    exclusive: new FormControl(right.exclusive)
  };
}

export type DistributionRightControls = ReturnType<typeof createDistributionRightControls>;

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
    if (movie.originalLanguages.includes(language)) {
      value.original = true;
      (<FormGroup>this.languages).addControl(
        language,
        new FormGroup(createLanguageControl(createMovieLanguageSpecification(value), true))
      );
    }
    (<FormGroup>this.languages).addControl(
      language,
      new FormGroup(createLanguageControl(createMovieLanguageSpecification(value)))
    );
  }

  removeLanguage(language: LanguagesSlug) {
    (<FormGroup>this.languages).removeControl(language);
    this.updateValueAndValidity();
  }
}
