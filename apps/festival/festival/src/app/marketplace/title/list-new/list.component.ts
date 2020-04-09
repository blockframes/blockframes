import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';

import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { FormControl, Validators, FormArray } from '@angular/forms';
import { CatalogSearchForm, AvailsSearchForm } from '@blockframes/distribution-deals/form/search.form';
import { staticModels } from '@blockframes/utils/static-model';
import { LanguagesLabel, LanguagesSlug, LANGUAGES_LABEL } from '@blockframes/utils/static-model/types';
import { getCodeIfExists } from '@blockframes/utils/static-model/staticModels';
import { FireAnalytics } from '@blockframes/utils/analytics/app-analytics';
import { algolia } from '@env';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private sub: Subscription;
  public movieSearchResults$: Observable<any>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new CatalogSearchForm();
  public searchbarTextControl: FormControl = new FormControl('');

  public availsForm = new AvailsSearchForm();

  // TODO try to use or create reusable component for every filter bellow

  // country
  public countries = staticModels['TERRITORIES'];

  // languages
  public languageControl: FormControl = new FormControl('', [
    Validators.required
  ]);
  public languagesFilter$: Observable<string[]>;
  public selectedLanguages$: Observable<string[]>;

  // status
  public movieProductionStatuses = staticModels['MOVIE_STATUS'];

  public movieIndex = algolia.indexNameMovies;
  // TODO use FormList after #2489 has been fixed
  public sellersForm = new FormArray([]);

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    private analytics: FireAnalytics,
  ) { }

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    this.movieSearchResults$ = this.movieQuery.selectAll({limitTo: 10});
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  public addLanguage(language: LanguagesLabel) {
    /**
     * We want to exchange the label for the slug,
     * because for our backend we need to store the slug.
     */
    const languageSlug: LanguagesSlug = getCodeIfExists('LANGUAGES', language);
    if (LANGUAGES_LABEL.includes(language)) {
      this.filterForm.addLanguage(languageSlug);
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
    this.filterForm.removeLanguage(languageSlug);
    this.analytics.event('removedLanguage', { language });
  }
}
