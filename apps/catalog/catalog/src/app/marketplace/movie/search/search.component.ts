// Angular
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';

// RxJs
import { Observable, combineLatest } from 'rxjs';
import { map, debounceTime, switchMap, distinctUntilChanged, pluck, filter, startWith, tap } from 'rxjs/operators';

// Others
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { MovieSearchForm } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-movie-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MarketplaceSearchComponent implements OnInit {
  public movieSearchResults$: Observable<any>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new MovieSearchForm();

  constructor(private movieService: MovieService, private dynTitle: DynamicTitleService) { }

  ngOnInit() {
    // Immplcity we only want accepted movies
    this.filterForm.storeConfig.add('accepted');
    this.dynTitle.setPageTitle('Titles');
    this.movieSearchResults$ = combineLatest([this.filterForm.valueChanges, this.sortByControl.valueChanges])
      .pipe(
        startWith(this.filterForm.value),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(observables => observables[0] = this.filterForm.search()),
        pluck('hits'),
        map(results => results.map(movie => movie.objectID)),
        tap(console.log),
        switchMap(movieIds => {
          // If empty get all the movies from akita
          if (!this.filterForm.isEmpty()) {
            return this.movieService.valueChanges().pipe(
              filter(movies => {
                for (const movie of movies) {
                  return movieIds.includes(movie.id)
                }
              }),
              map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value)))
            )
          } else {
            return this.movieService.valueChanges().pipe(
              filter(movies => {
                for (const movie of movies) {
                  return movieIds.includes(movie.id)
                }
              }),
              map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value)))
            )
          }
        })
      )
  }
}
