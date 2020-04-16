import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  Inject,
} from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { MovieService, MovieQuery } from '@blockframes/movie/+state';
import { FormControl } from '@angular/forms';
import { MovieSearch, MovieSearchForm } from '@blockframes/movie/form/search.form';
import { map, distinctUntilChanged, debounceTime, filter, switchMap, pluck, startWith } from 'rxjs/operators';
import { MoviesIndex } from '@blockframes/utils/algolia';
import { Index } from 'algoliasearch';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';


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

  public filterForm = new MovieSearchForm();

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
    @Inject(MoviesIndex) public movieIndex: Index,
  ) { }

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    this.movieSearchResults$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      filter(search => !this.isEmpty(search)),
      distinctUntilChanged(),
      switchMap(search => {

        let budgetFilter = ''
        const budgetsFrom = search.budget.map(budget => `budget.from:${budget.from}`).join(' OR ');
        const budgetsTo = search.budget.map(budget => `budget.to:${budget.to}`).join(' OR ');
        if ( search.budget.length === 1) {
          budgetFilter = `${budgetsFrom} AND ${budgetsTo}`;
        } else if ( search.budget.length > 1) {
          budgetFilter =  `(${budgetsFrom}) AND (${budgetsTo})`;
        }

        return this.movieIndex.search({
          query: search.query,
          facetFilters: [
            [...search.genres.map(genre => `genres:${genre}`)], // same facet inside an array means OR for algolia
            [...search.originCountries.map(country => `originCountries:${country}`)],
            [
              ...search.languages.original.map(lang => `languages.original:${lang}`),
              ...search.languages.dubbed.map(lang => `languages.dubbed:${lang}`),
              ...search.languages.subtitle.map(lang => `languages.subtitle:${lang}`),
              ...search.languages.caption.map(lang => `languages.caption:${lang}`),
            ],
            [...search.productionStatus.map(status => `status:${status}`)],
            [...search.sellers.map(seller => `orgName:${seller}`)],
          ],
          filters: budgetFilter,
        });
      }),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),

      // join retrieved movieIds from algolia with the movies from the state
      switchMap(movieIds => this.movieQuery.selectAll({
        filterBy: movie => movieIds.includes(movie.id),
        sortBy: (a, b) => sortMovieBy(a, b, this.sortByControl.value),
      })),

      // display the first 10 movies from the state (no useless queries)
      // prevent the user to see an empty page at the beginning
      startWith(this.movieQuery.getAll()),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private isEmpty(search: MovieSearch) {
    return (
      search.query === '' &&
      search.genres.length === 0 &&
      search.originCountries.length === 0 &&
      search.languages.original.length === 0 &&
      search.languages.dubbed.length === 0 &&
      search.languages.subtitle.length === 0 &&
      search.languages.caption.length === 0 &&
      search.productionStatus.length === 0 &&
      search.budget.length === 0 &&
      search.sellers.length === 0
    );
  }
}
