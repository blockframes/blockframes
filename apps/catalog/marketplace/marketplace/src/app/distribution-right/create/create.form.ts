import { FormEntity } from '@blockframes/utils';
import { DistributionRight } from '../+state/basket.model';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import {
  TerritoriesSlug,
  LanguagesLabel,
  TERRITORIES_SLUG
} from '@blockframes/movie/movie/static-model/types';

export class DistributionRightForm extends FormEntity<DistributionRight> {
  constructor() {
    super({
      medias: new FormArray([]),
      languages: new FormControl([]),
      dubbings: new FormControl([]),
      subtitles: new FormControl([]),
      duration: new FormGroup({
        from: new FormControl(),
        to: new FormControl()
      }),
      territories: new FormArray([])
    });
  }

  addTerritory(territory: string) {
    // Check it's part of the list available
    if (!TERRITORIES_SLUG.includes(territory as TerritoriesSlug)) {
      throw new Error(`Territory ${territory} is not part of the list`);
    }
    // Check it's not already in the form control
    const territories = this.get('territories').value;
    if (!territories.includes(territory)) {
      // I guess TS complains about, that territories is not an array.
      (<FormArray>this.get('territories')).push(new FormControl(territory));
    }
    // Else do nothing as it's already in the list
  }

  removeTerritory(index: number) {
    // I guess TS complains about, that territories is not an array.
    (<FormArray>this.get('territories')).removeAt(index);
  }

  checkMedia(mediaChecked: string) {
    // check if media is already checked by the user
    if (!this.get('medias').value.includes(mediaChecked)) {
      // I guess TS complains about, that territories is not an array.
      (<FormArray>this.get('medias')).push(new FormControl(mediaChecked));
    } else if (this.get('medias').value.includes(mediaChecked)) {
      const uncheckMedia = this.get('medias').value.indexOf(mediaChecked);
      // I guess TS complains about, that territories is not an array.
      (<FormArray>this.get('medias')).removeAt(uncheckMedia);
    } else {
      throw new Error(`Media ${mediaChecked} doesn't exist`);
    }
  }

  addLanguage(language: LanguagesLabel) {
    this.get('languages').setValue([...this.get('languages').value, language]);
  }

  addDubbings(language: LanguagesLabel) {
    this.get('dubbings').setValue([...this.get('dubbings').value, language]);
  }

  addSubtitles(language: LanguagesLabel) {
    this.get('subtitles').setValue([...this.get('subtitles').value, language]);
  }

  removeLanguage(language: LanguagesLabel) {
    const updatedLanguage = this.get('languages').value.filter(newLanguages => {
      return newLanguages !== language;
    });
    this.get('languages').setValue(updatedLanguage);
  }

  removeDubbings(language: LanguagesLabel) {
    const updatedLanguage = this.get('languages').value.filter(newLanguages => {
      return newLanguages !== language;
    });
    this.get('languages').setValue(updatedLanguage);
  }

  removeSubtitles(language: LanguagesLabel) {
    const updatedLanguage = this.get('languages').value.filter(newLanguages => {
      return newLanguages !== language;
    });
    this.get('languages').setValue(updatedLanguage);
  }
}
