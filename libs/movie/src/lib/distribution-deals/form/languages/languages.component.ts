import { MovieLanguageSpecification } from './../../../movie/+state/movie.firestore';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { MovieVersionInfoForm } from '@blockframes/movie/movieform/version-info/version-info.form';
import { FormStaticValue } from '@blockframes/utils/form';
import { LanguagesSlug } from '@blockframes/utils/static-model';
import { MatSlideToggleChange } from '@angular/material';
import { createMovieLanguageSpecification } from '@blockframes/movie/movie+state/movie.model';

@Component({
  selector: '[form] distribution-form-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionDealLanguagesComponent {
  @Input() form: MovieVersionInfoForm;

  public languageCtrl = new FormStaticValue(null, 'LANGUAGES');

  public formIsDisabled = false;

  public updateForm() {
    if (this.languageCtrl.valid) {
      this.form.addLanguage(this.languageCtrl.value);
      this.languageCtrl.reset();
    }
  }

  public removeLanguage(language: LanguagesSlug) {
    this.form.removeLanguage(language);
  }

  /**
   * @description when user changes languages we want to update the state of the toggle buttons
   * @param language language for checking the value
   * @param button which button should be checked
   */
  public isChecked(language: string, button: string) {
    return this.form.get(language).value[button];
  }

  /**
   * @description update the specification of this language
   * @param event emitted by button
   * @param language language which should be updated
   */
  public updateVersionInfo(event: MatButtonToggleChange, language: string) {
    const state: MovieLanguageSpecification = this.form.get(language).value;
    this.form.get(language).setValue({ ...state, [event.value]: !state[event.value] });
  }

  public stateOfForm(event: MatSlideToggleChange) {
    if(event.checked) {
      this.languageCtrl.disable();
      this.formIsDisabled = true

      const languageSpec: MovieLanguageSpecification = createMovieLanguageSpecification({
        original: false,
        dubbed: true,
        subtitle: true,
        caption: true,
      });

      this.form.addLanguage('all', languageSpec);
    } else {
      this.languageCtrl.enable();
      this.formIsDisabled = false;

      this.form.removeLanguage('all');
    }
  }
}
