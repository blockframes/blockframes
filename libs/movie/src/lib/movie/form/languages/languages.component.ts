import { Component, ChangeDetectionStrategy, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MovieVersionInfoForm } from '@blockframes/movie/form/movie.form';
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
    this.form.addLanguage(this.languageCtrl.value)
    this.languageCtrl.reset();
    this.showButtons = true;
  }

  deleteLanguage(language: Language) {
    this.form.removeLanguage(language);
  }
}
