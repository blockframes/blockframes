import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { LanguagesLabel, LanguagesSlug, LANGUAGES_LABEL } from '@blockframes/utils/static-model';
import { getCodeIfExists } from '@blockframes/utils/static-model/staticModels';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { Observable } from 'rxjs';
import { startWith, distinctUntilChanged, debounceTime, map } from 'rxjs/operators';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent implements OnInit {

  @Input() languagesFilterForm: FormGroup;

  /** control for the language text input */
  public languageControl: FormControl = new FormControl('', [Validators.required]);

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = new FormArray([]); // TODO use FormList after #2489 has been fixed

  /** Observable that contains the result of the searched language */
  public languagesAutocomplete$: Observable<string[]>;

  constructor(
    private analytics: FireAnalytics,
  ) { }

  ngOnInit() {
    /** fill languages autocomplete */
    this.languagesAutocomplete$ = this.languageControl.valueChanges.pipe(
      startWith(''),
      distinctUntilChanged(),
      debounceTime(300),
      map(value => this._languageAutocomplete(value)),
    );
  }

  /** Add a new language *(only it's slug)* to the chips list */
  public addLanguage(language: LanguagesLabel) {

    const languageSlug: LanguagesSlug | null = getCodeIfExists('LANGUAGES', language);
    if (LANGUAGES_LABEL.includes(language)) {
      this.selectedLanguages.push(new FormControl(languageSlug));
      this.analytics.event('addedLanguage', { language });
    } else {
      this.languageControl.setErrors({languageNotSupported: true});
      // throw new Error('Something went wrong. Please choose a language from the drop down menu.');
    }
  }

  public removeLanguage(index: number) {
    this.selectedLanguages.removeAt(index);
  }

  public languageFilterChange(event: MatCheckboxChange, language: string, type: 'original' | 'dubbed' | 'subtitle' | 'caption') {

    if (event.checked) { // ADD
      (this.languagesFilterForm.get(type) as FormArray).push(new FormControl(language));
    } else { // REMOVE
      const index =
        (this.languagesFilterForm.get(type) as FormArray)
          .controls
          .map(currentControl => currentControl.value)
          .findIndex((value: string) => value === language);

      if (index === -1) return; // the user wanted to delete a language that wasn't present : do nothing

      (this.languagesFilterForm.get(type) as FormArray).removeAt(index);
    }
  }

  /** Match the inputted text with the language labels to fill up the autocomplete option list */
  private _languageAutocomplete(value: string): string[] {
    if (value) {
      return LANGUAGES_LABEL.filter(language => language.toLowerCase().includes(value.toLowerCase()));
    }
  }
}
