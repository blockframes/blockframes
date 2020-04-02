import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { CatalogSearchForm } from '@blockframes/distribution-deals/form/search.form';
import { staticModels, LanguagesLabel, LanguagesSlug, LANGUAGES_LABEL, MovieStatusLabel, MOVIE_STATUS_LABEL } from '@blockframes/utils/static-model';
import { FormControl, Validators } from '@angular/forms';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { getCodeIfExists } from '@blockframes/utils/static-model/staticModels';
import { Observable, BehaviorSubject } from 'rxjs';
import { NumberRange } from '@blockframes/utils/common-interfaces';
import { BUDGET_LIST } from '@blockframes/movie/form/budget/budget.form';

@Component({
  selector: '[form] movie-filter',
  templateUrl: './movie-filter.component.html',
  styleUrls: ['./movie-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFilterComponent {

  // TODO USE EXISTING REUSABLE COMPONENT OR EXTRACT THEM INSTEAD OF THIS GARBAGE BELOW

  @Input() form: CatalogSearchForm;

  /** Filter for autocompletion */
  public countries = staticModels['TERRITORIES'];
  /** Individual form controls for filtering */
  public languageControl: FormControl = new FormControl('', [
    Validators.required
  ]);
  public languagesFilter$: Observable<string[]>;

  /** Observables on the languages selected */
  public selectedLanguages$: Observable<string[]>;

  /** Data for UI */
  public movieProductionStatuses: MovieStatusLabel[] = MOVIE_STATUS_LABEL;

  public budgetList: NumberRange[] = BUDGET_LIST;

  /** selected seller orgs to filter */
  public selectedSellers$ = new BehaviorSubject<string[]>([]);

  /** seller org autocomplete search bar */
  public orgSearchResults$: Observable<any>;


  constructor(
    private analytics: FireAnalytics,
  ) {}

  public addLanguage(language: LanguagesLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const languageSlug: LanguagesSlug = getCodeIfExists('LANGUAGES', language);
    if (LANGUAGES_LABEL.includes(language)) {
      this.form.addLanguage(languageSlug);
      this.analytics.event('addedLanguage', { language });
    } else {
      throw new Error('Something went wrong. Please choose a language from the drop down menu.');
    }
  }

  public removeLanguage(language: LanguagesLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const languageSlug: LanguagesSlug = getCodeIfExists('LANGUAGES', language);
    this.form.removeLanguage(languageSlug);
    this.analytics.event('removedLanguage', { language });
  }

  // BUDGET FIELD

  public hasBudget(budget: NumberRange) {
    const value = this.form.get('estimatedBudget').value;
    if (!value.includes(budget)) {
      this.form.get('estimatedBudget').setValue([...value, budget]);
    } else {
      const valueWithoutBudget = value.filter(v => v !== budget);
      this.form.get('estimatedBudget').setValue(valueWithoutBudget);
    }
  }

  // PRODUCTION STATUS FIELD

  public hasStatus(status: MovieStatusLabel) {

    // We want to exchange the label for the slug,
    // because for our backend we need to store the slug.
    const productionStatusSlug = getCodeIfExists('MOVIE_STATUS', status);
    if (
      this.movieProductionStatuses.includes(status) &&
      !this.form.productionStatus.value.includes(productionStatusSlug)
    ) {
      this.form.addStatus(productionStatusSlug);
      this.analytics.event('addedMovieStatus', { status });
    } else {
      this.form.removeStatus(productionStatusSlug);
      this.analytics.event('removedMovieStatus', { status });
    }
  }

  // SELLER FIELD

  public addSeller(seller: string) {
    const newSelectedSellers = [seller, ...this.selectedSellers$.getValue()];
    this.selectedSellers$.next(newSelectedSellers);
  }

  public removeSeller(index: number) {
    const newSelectedSellers = this.selectedSellers$.getValue();
    newSelectedSellers.splice(index, 1);
    this.selectedSellers$.next(newSelectedSellers);
  }
}
