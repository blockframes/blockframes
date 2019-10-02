import { Validators } from '@angular/forms';
import {
  FormEntity,
  numberRangeValidator,
} from '@blockframes/utils';
import { DistributionRight, createDistributionRight } from '../+state/basket.model';
import { FormArray, FormGroup, FormControl } from '@angular/forms';
import {
  TerritoriesSlug,
  TERRITORIES_SLUG,
  LanguagesSlug
} from '@blockframes/movie/movie/static-model/types';

export class DistributionRightForm extends FormEntity<DistributionRight> {
  constructor() {
    const distributionRight = createDistributionRight();
    super({
      medias: new FormArray(
        (distributionRight.medias || []).map(media => new FormControl(media)),
        Validators.required
      ),
      languages: new FormControl(distributionRight.languages, Validators.required),
      dubbings: new FormControl(distributionRight.dubbings),
      subtitles: new FormControl(distributionRight.subtitles),
      duration: new FormGroup(
        {
          from: new FormControl(distributionRight.duration.from, [Validators.required]),
          to: new FormControl(distributionRight.duration.to, [Validators.required])
        },
        [Validators.required, numberRangeValidator('from', 'to')]
      ),
      territories: new FormArray(
        (distributionRight.territories || []).map(territory => new FormControl(territory)),
        Validators.required
      ),
      exclusive: new FormControl(distributionRight.exclusive)
    });
  }

  addTerritory(territory: TerritoriesSlug) {
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

  addLanguage(language: LanguagesSlug) {
    this.get('languages').setValue([...this.get('languages').value, language]);
  }

  addDubbings(language: LanguagesSlug) {
    this.get('dubbings').setValue([...this.get('dubbings').value, language]);
  }

  addSubtitles(language: LanguagesSlug) {
    this.get('subtitles').setValue([...this.get('subtitles').value, language]);
  }

  removeLanguage(language: LanguagesSlug) {
    const updatedLanguage = this.get('languages').value.filter(newLanguages => {
      return newLanguages !== language;
    });
    this.get('languages').setValue(updatedLanguage);
  }

  removeDubbings(language: LanguagesSlug) {
    const updatedLanguage = this.get('languages').value.filter(newLanguages => {
      return newLanguages !== language;
    });
    this.get('languages').setValue(updatedLanguage);
  }

  removeSubtitles(language: LanguagesSlug) {
    const updatedLanguage = this.get('languages').value.filter(newLanguages => {
      return newLanguages !== language;
    });
    this.get('languages').setValue(updatedLanguage);
  }
}
