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
import { staticModels } from '@blockframes/utils/static-model';
import { MovieSearchForm } from '@blockframes/movie/form/search.form';
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
  public genres = staticModels['GENRES'];
  public countries = staticModels['TERRITORIES'];
  public movieProductionStatuses = staticModels['MOVIE_STATUS'];

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
      filter(search => !MovieSearchForm.isEmpty(search)),
      distinctUntilChanged((a, b) => MovieSearchForm.equals(a, b)),
      map(() => this.filterForm.toAlgoliaQuery()),
      switchMap(query => this.movieIndex.search(query)),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),

      // join retrieved movieIds from algolia with the movies from the state
      switchMap(movieIds => this.movieQuery.selectAll({
        filterBy: movie => movieIds.includes(movie.id),
        sortBy: (a, b) => sortMovieBy(a, b, this.sortByControl.value),
      })),

      // display the first 10 movies from the state (no useless queries)
      // prevent the user to see an empty page at the beginning
      startWith(this.movieQuery.getAll({limitTo: 10})),
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
