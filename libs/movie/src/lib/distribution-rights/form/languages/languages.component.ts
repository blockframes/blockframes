import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MovieVersionInfoForm } from '@blockframes/movie/form/movie.form';
import { FormStaticValue } from '@blockframes/utils/form';
import { LanguagesSlug } from '@blockframes/utils/static-model';

@Component({
  selector: '[form] distribution-form-languages',
  templateUrl: './languages.component.html',
  styleUrls: ['./languages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributionRightLanguagesComponent implements OnInit {
  @Input() form: MovieVersionInfoForm;

  public languageCtrl = new FormStaticValue(null, 'LANGUAGES');

  public toggleCtrl = new FormControl();

  ngOnInit() {
    this.toggleCtrl.valueChanges.subscribe(value => this.stateOfForm(value));
  }

  public updateForm() {
    if (this.languageCtrl.valid) {
      this.form.addLanguage(this.languageCtrl.value);
      this.languageCtrl.reset();
    }
  }

  public removeLanguage(language: LanguagesSlug) {
    if (language === 'all') {
      this.stateOfForm(false);
    }
    this.form.removeLanguage(language);
  }

  /**
   * @description helper function
   * @param language language to set the value for
   * @param prop the property which should be set to true
   */
  private addAllVersions(language: string, prop: string) {
    this.form.get(language).get(prop).setValue(true);
  }

  /**
   * @description disable the form and set all versions to true
   * @param event boolean value if button is checked or not
   */
  public stateOfForm(value: boolean) {
    if (value) {
      this.form.addLanguage('all');
      this.languageCtrl.disable();
      for (const language in this.form.controls) {
        const buttons = ['dubbed', 'subtitle', 'caption'];
        buttons.forEach(button => {
          this.addAllVersions(language, button);
        });
        this.form.disable();
      }
    } else {
      this.languageCtrl.enable();
      this.form.removeLanguage('all');
    }
  }
}
