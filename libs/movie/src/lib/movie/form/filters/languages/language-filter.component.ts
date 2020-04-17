import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { FormList } from '@blockframes/utils/form';
import { ExtractSlug } from '@blockframes/utils/static-model/staticModels';

@Component({
  selector: '[languagesFilterForm] title-language-filter',
  templateUrl: './language-filter.component.html',
  styleUrls: ['./language-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LanguageFilterComponent {

  @Input() languagesFilterForm: FormGroup; // FormGroup of FormList

  /** control for the language text input */
  public languageControl: FormControl = new FormControl('', [Validators.required]);

  /** list of selected language (chips), they can later be added in *'original'*, *'subtitle'*, etc... */
  public selectedLanguages = FormList.factory<ExtractSlug<'LANGUAGES'>>([]);

  constructor(
    private analytics: FireAnalytics,
  ) { }

  /** Add a new language *(only it's slug)* to the chips list */
  public addLanguage(language: string) {
    this.selectedLanguages.push(new FormControl(language));
    this.analytics.event('addedLanguage', { language });
  }

  /** Remove a language from the chips **AND** from every versions */
  public removeLanguage(lang: ExtractSlug<'LANGUAGES'>) {

    // remove the lang from every versions (original, subtitle, ...)
    this.languageFilterChange(false, lang, 'original');
    this.languageFilterChange(false, lang, 'dubbed');
    this.languageFilterChange(false, lang, 'subtitle');
    this.languageFilterChange(false, lang, 'caption');

    // then remove the chips
    const index = this.selectedLanguages.controls.findIndex(control => control.value === lang);
    this.selectedLanguages.removeAt(index);
  }

  // TODO this function is a workaround and should not stay like that: (see issue#2503)
  public languageFilterChange(checked: boolean, language: ExtractSlug<'LANGUAGES'>, type: 'original' | 'dubbed' | 'subtitle' | 'caption') {

    if (checked) { // ADD
      (this.languagesFilterForm.get(type) as FormList<ExtractSlug<'LANGUAGES'>>).add(language);
    } else { // REMOVE
      const index =
        (this.languagesFilterForm.get(type) as FormList<ExtractSlug<'LANGUAGES'>>)
          .controls
          .map(currentControl => currentControl.value)
          .findIndex((value: string) => value === language);

      if (index === -1) return; // the user wanted to delete a language that wasn't present : do nothing

      (this.languagesFilterForm.get(type) as FormList<ExtractSlug<'LANGUAGES'>>).removeAt(index);
    }
  }
}
