import { MovieLanguageSpecification } from '@blockframes/movie/movie/+state/movie.firestore';
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

  /**
   * @description helper function
   * @param language language to set the value for
   * @param prop the property which should be set to true
   */
  private addAllVersions(language: string, prop: string) {
    this.form.get(language).value[prop] = true;
  }

  /**
   * @description disable the form and set all versions to true
   * @param event boolean value if button is checked or not
   */
  public stateOfForm(event: MatSlideToggleChange) {
    if (event.checked) {
      this.form.addLanguage('all');
      this.languageCtrl.disable();
      this.formIsDisabled = true;
      for (const language in this.form.controls) {
        const buttons = ['dubbed', 'subtitle', 'caption'];
        buttons.forEach(button => {
          this.isChecked(language, button);
          this.addAllVersions(language, button);
        });
      }
    } else {
      this.languageCtrl.enable();
      this.formIsDisabled = false;
      this.form.removeLanguage('all');
    }
  }
}
