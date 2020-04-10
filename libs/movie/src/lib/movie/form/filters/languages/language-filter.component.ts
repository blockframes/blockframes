import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent {

  @Input() languagesFilterForm: FormGroup;

  /** control for the language text input */
  public languageControl: FormControl = new FormControl('', [Validators.required]);

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = new FormArray([]); // TODO use FormList after #2489 has been fixed

  constructor(
    private analytics: FireAnalytics,
  ) { }

  /** Add a new language *(only it's slug)* to the chips list */
  public addLanguage(language: string) {
    this.selectedLanguages.push(new FormControl(language));
    this.analytics.event('addedLanguage', { language });
  }

  // TODO this function is a workaround and should not stay like that: (see issue#2503)
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
}
