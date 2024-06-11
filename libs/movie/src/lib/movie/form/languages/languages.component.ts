import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { createMovieLanguageSpecification, Language } from '@blockframes/model';
import { MovieVersionInfoForm, VersionSpecificationForm } from '../../form/movie.form';
import { getKeyIfExists } from '@blockframes/utils/helpers';

@Component({
  selector: '[form] languages-form',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguagesFormComponent {
  @Input() form: MovieVersionInfoForm;
  public languageCtrl = new UntypedFormControl();
  public showButtons = true;

  addLanguage() {
    const language = getKeyIfExists('languages', this.languageCtrl.value);
    if(language){
      const spec = createMovieLanguageSpecification({});
      this.form.addControl(language, new VersionSpecificationForm(spec));
      this.languageCtrl.reset();
      this.showButtons = true;
    }
  }

  deleteLanguage(language: Language) {
    this.form.removeControl(language);
  }
}
