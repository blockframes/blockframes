import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { VersionSpecificationForm, MovieVersionInfoForm } from '@blockframes/movie/form/movie.form';
import { createMovieLanguageSpecification } from '@blockframes/movie/+state';
import { Language } from '@blockframes/utils/static-model';

@Component({
  selector: 'languages-form',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguagesFormComponent implements OnInit {
  // @Input() form: MovieVersionInfoForm;
  form = new MovieVersionInfoForm();
  public languageCtrl = new FormControl();
  public showButtons = true;

  constructor() {}

  ngOnInit() {
    console.log('coucou', this.form)
  }

  addLanguage(form: MovieVersionInfoForm) {
    const spec = createMovieLanguageSpecification({});
    form.addControl(this.languageCtrl.value, new VersionSpecificationForm(spec));
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(form: MovieVersionInfoForm, language: Language) {
    form.removeControl(language);
  }
}
