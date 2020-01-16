import { createMovieLanguageSpecification } from '@blockframes/movie/movie+state/movie.model';
import { MovieLanguageSpecification } from './../../+state/movie.firestore';
import { FormEntity } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { LanguagesSlug } from '@blockframes/utils/static-model';

export function createLanguageControl(
  versionInfo: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }>
) {
  const controls = {};
  for (const language in versionInfo) {
    controls[language] = new VersionSpecificationForm(versionInfo[language]);
  }
  return controls;
}

export class MovieVersionInfoForm extends FormEntity<any> {
  constructor(
    versionInfo: Partial<{ [language in LanguagesSlug]: MovieLanguageSpecification }> = {}
  ) {
    super(createLanguageControl(versionInfo));
  }

  addLanguage(language: LanguagesSlug, value?: Partial<MovieLanguageSpecification>) {
    const spec = createMovieLanguageSpecification(value);
    this.setControl(language, new VersionSpecificationForm(spec));
  }

  removeLanguage(language: LanguagesSlug) {
    this.removeControl(language);
    this.updateValueAndValidity();
  }
}

class VersionSpecificationForm extends FormEntity<any> {
  constructor(versionSpecifictaion: MovieLanguageSpecification) {
    super({
      original: new FormControl(versionSpecifictaion.original),
      dubbed: new FormControl(versionSpecifictaion.dubbed),
      subtitle: new FormControl(versionSpecifictaion.subtitle),
      caption: new FormControl(versionSpecifictaion.caption)
    });
  }
}
