// RxJs
import { Observable, Subscription } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

// Angular
import { FormControl, FormArray } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  OnDestroy,
} from '@angular/core';

// Material
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// Types
import { SlugAndLabel, getLabelBySlug } from '@blockframes/utils/static-model/staticModels';
import { staticModels, LanguagesSlug } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/movie/+state/movie.firestore';

// Utils
import { FormStaticValue } from '@blockframes/utils/form';
import { FormList } from '@blockframes/utils/form/forms/list.form';
import isEqual from 'lodash/isEqual';

// Form
import { MovieVersionInfoForm } from './version-info.form';

@Component({
  selector: '[form] [originalLanguages] movie-form-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormVersionInfoComponent implements OnInit, OnDestroy {
  @Input() form: MovieVersionInfoForm;
  @Input() originalLanguages: FormList<LanguagesSlug, FormStaticValue<'LANGUAGES'>>

  private sub: Subscription;

  public staticLanguages = staticModels.LANGUAGES;

  // For autocompletion
  public languageFilterCtrl: FormControl = new FormControl();

  // syncs with versionInfoForm
  public versionInfoCtrl: FormArray = new FormArray([]);

  // Holds the information for autocompletion
  public languages$: Observable<SlugAndLabel[]>;

  // For tempalte
  public getCode = language => {
    return getLabelBySlug('LANGUAGES', language);
  };


  ngOnInit() {
    this.sub = this.originalLanguages.valueChanges
      .pipe(startWith(this.originalLanguages.value))
      .subscribe(languages => {
        languages.forEach(language => {
          if (!this.form.get(language)) {
            this.form.addLanguage(language, { original: true });
          }
        });
      });

    this.versionInfoCtrl.valueChanges.subscribe(languages => {
      const formState = Object.keys(this.form.value);
      const versionInfoState = this.versionInfoCtrl.value;
      languages.forEach(language => {
        if (!this.form.get(language)) {
          this.form.addLanguage(language);
        }
        if (!isEqual(formState.sort(), versionInfoState.sort())) {
          formState.forEach(langToRemove => {
            if (!versionInfoState.includes(langToRemove)) {
              this.form.removeLanguage(langToRemove as LanguagesSlug);
            }
          });
        }
      });
    });
    this.languages$ = this.languageFilterCtrl.valueChanges.pipe(
      startWith(this.languageFilterCtrl.value),
      map(language => {
        return language ? this.languageFilter(language) : this.staticLanguages.slice();
      })
    );
  }

  /**
   * @description returns a filtered array of all possible languages depending on the value param
   * @param value string of what the users typed in
   */
  private languageFilter(value: string): SlugAndLabel[] {
    const filterValue = value.toLowerCase();
    return this.staticLanguages.filter(language => language.slug.trim().includes(filterValue));
  }

  /**
   * @description add language to the corresponding forms
   * @param event autocompletion value
   */
  public addLanguageVersion(event: MatAutocompleteSelectedEvent) {
    this.form.addLanguage(event.option.value);
    this.versionInfoCtrl.push(new FormControl(event.option.value));
    this.languageFilterCtrl.reset();
  }

  /**
   * @description update the specification of this language
   * @param event emitted by button
   * @param language language which should be updated
   */
  public updateVersionInfo(event: MatButtonToggleChange, language: LanguagesSlug) {
    const state: MovieLanguageSpecification = this.form.get(language).value;
    this.form.get(language).setValue({ ...state, [event.value]: !state[event.value] });
  }

  /**
   * @description remove language from forms
   * @param language language to be remove
   * @param index optional parameter when we want to delete the language
   * also in the originalLanguages form
   */
  public removeLanguageVersion(index: number, language: LanguagesSlug) {
    this.versionInfoCtrl.removeAt(index);
    this.form.removeLanguage(language);
  }

  /**
   * @description when user changes languages we want to update the state of the toggle buttons
   * @param language language for checking the value
   * @param button which button should be checked
   */
  public isChecked(language: LanguagesSlug, button: string){
    return this.form.get(language).value[button];
  }


  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
