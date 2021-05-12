import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { MovieVersionInfoForm, VersionSpecificationForm } from '@blockframes/movie/form/movie.form';
import { Language } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] languages-form',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguagesFormComponent {

  @Input() form: MovieVersionInfoForm;
  public languageCtrl = new FormControl();
  public showButtons = true;

  addLanguage() {
    const spec = createMovieLanguageSpecification({});
    this.form.addControl(this.languageCtrl.value, new VersionSpecificationForm(spec))
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(language: Language) {
    this.form.removeControl(language);
  }
}
