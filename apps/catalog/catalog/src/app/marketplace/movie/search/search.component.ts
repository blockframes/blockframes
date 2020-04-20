// Angular
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy
} from '@angular/core';
// Blockframes
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
// RxJs
import { Observable, Subscription } from 'rxjs';
import { startWith, map, debounceTime, switchMap, distinctUntilChanged, pluck, filter } from 'rxjs/operators';
// Others
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { MovieService } from '@blockframes/movie/+state';
import { MovieSearchForm } from '@blockframes/movie/form/search.form';

@Component({
  selector: 'catalog-movie-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  public movieSearchResults$: Observable<any>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new MovieSearchForm();

  constructor(
    private movieService: MovieService,
    private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    this.sub = this.movieService.syncCollection(ref => ref.limit(30)).subscribe();

    this.movieSearchResults$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      filter(() => !this.filterForm.isEmpty()),
      distinctUntilChanged(),
      switchMap(() => this.filterForm.search()),
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
}
