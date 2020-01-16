// RxJs
import { Observable, Subscription } from 'rxjs';
import { startWith, map, tap } from 'rxjs/operators';

// Angular
import { FormControl, FormArray } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  Input,
  OnDestroy,
  ViewChild,
  ElementRef
} from '@angular/core';

// Material
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

// Types
import { SlugAndLabel } from '@blockframes/utils/static-model/staticModels';
import { staticModels, LanguagesSlug } from '@blockframes/utils/static-model';
import { MovieLanguageSpecification } from '@blockframes/movie/movie/+state/movie.firestore';

// Utils
import { FormList } from '@blockframes/utils/form/forms/list.form';

// Form
import { MovieVersionInfoForm } from './version-info.form';

type LanguageType = 'original' | 'version';

@Component({
  selector: '[form] [originalLanguages] movie-form-version-info',
  templateUrl: './version-info.component.html',
  styleUrls: ['./version-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormVersionInfoComponent implements OnInit, OnDestroy {
  @Input() form: MovieVersionInfoForm;
  @Input() originalLanguages: FormList<string, FormControl>;

  private sub: Subscription;

  private formArraySub: Subscription;

  public staticLanguages = staticModels.LANGUAGES;

  public controls = {
    original: new FormControl(),
    version: new FormControl(),
    language: new FormArray([])
  };

  public $ = {
    original: this.select('original'),
    version: this.select('version')
  };

  public languages$: Observable<SlugAndLabel[]>;

  /* Observables on the version languages selected */
  public selectedLanguages$: Observable<string[]>;

  @ViewChild('originalInput', { static: false }) originalInput: ElementRef<HTMLInputElement>;

  @ViewChild('versionInput', { static: false }) versionInput: ElementRef<HTMLInputElement>;

  ngOnInit() {
    this.sub = this.originalLanguages.valueChanges
      .pipe(startWith(this.originalLanguages.value))
      .subscribe(languages => {
        languages.forEach(language => {
          if (!this.form.get(language)) {
            this.form.addLanguage(language as LanguagesSlug, { original: true });
            this.udpateForm(language, 'original');
          } else {
            this.form.removeLanguage(language);
            this.udpateForm(language, 'original');
          }
        });
      });
    this.selectedLanguages$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      map(language => {
        if (!!language) {
          return Object.keys(language);
        }
      })
    );
    this.formArraySub = this.form.valueChanges
      .pipe(startWith(this.form.value))
      .subscribe(languageObjects => {
        const languages = Object.keys(languageObjects);
        // create set for unique FormControls
        const formArrayState = this.controls.language.value.filter(controls => {
          if (!languages.includes(controls.value)) return true;
        });
        languages.forEach(language => {
          // add language if original is set to false and if language exists
          if (
            this.form.get(language) &&
            !this.form.get(language).value.original &&
            !formArrayState.includes(language)
          ) {
            this.controls.language.push(new FormControl(language));
          }
        });
      });
    /*     this.controls['language'].valueChanges.subscribe(console.log); */
    this.form.valueChanges.subscribe(console.log);
    this.originalLanguages.valueChanges.subscribe(console.log);
  }

  /**
   * @description update form with old value
   * @param toCheckLanguage 
   * @param type 
   */
  public udpateForm(toCheckLanguage: string, type: LanguageType) {
    const originalVersionState = this.form.value;
    const languagesToUpdate: string[] = [];
    if (type === 'original') {
      // sync the to forms when language property orignial = true
      const originalLanguages = this.originalLanguages.value;
      for (const language in originalVersionState) {
        if (originalVersionState[language].original) {
          languagesToUpdate.push(language);
        }
      }
      languagesToUpdate.forEach(language => {
        if (!originalLanguages.includes(language)) {
          this.removeLanguageVersion(type, language as LanguagesSlug);
        }
      });
    } else {
      // sync with the formArray when property original = false
      const languageFormArray: FormControl[] = this.controls.language.value;
      for (const language in originalVersionState) {
        if (!originalVersionState[language].original) {
          languagesToUpdate.push(language);
        }
      }
      languageFormArray.forEach(language => {
        if (!languagesToUpdate.includes(language.value)) {
          this.removeLanguageVersion(type, language.value);
        }
      });
    }
  }

  /**
   * @description returns depending on the input possible languages
   * @param type either original or version depinding on what array we want to operate
   */
  public select(type: LanguageType): Observable<string[] | SlugAndLabel[]> {
    return this.controls[type].valueChanges.pipe(
      startWith(this.controls[type].value),
      map((language: string) => {
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
   * @description beautifier function
   * @param language language which should be checked
   */
  private isNotAddedInOriginalLanguages(language: string) {
    return !this.originalLanguages.get(language);
  }

  /**
   * @description add language to the corresponding forms
   * @param event autocompletion value
   * @param type either original or version
   */
  public addLanguageVersion(event: MatAutocompleteSelectedEvent, type: LanguageType) {
    if (type === 'original' && this.isNotAddedInOriginalLanguages(event.option.value)) {
      this.form.addLanguage(event.option.value, { original: true });
      this.originalLanguages.add(event.option.value);
      this.originalInput.nativeElement.value = '';
    } else {
      this.form.addLanguage(event.option.value);
      this.versionInput.nativeElement.value = '';
    }
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
   * @param element either FormControl or string depending where the function is called
   * @param index optional parameter when we want to delete the language
   * also in the originalLanguages form
   */
  public removeLanguageVersion(type: LanguageType, element: LanguagesSlug, index?: number) {
    if (type === 'original') {
      this.originalLanguages.removeAt(index);
    } else {
      this.controls.language.removeAt(index);
    }
  }

  /**
   * @description this function is for an ngIf statement to see if children should render
   * @param language langue to be checked if already set to true
   */
  public isNotOriginal(language: string): boolean {
    return !this.form.get(language).value.original;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.formArraySub.unsubscribe();
  }
}
