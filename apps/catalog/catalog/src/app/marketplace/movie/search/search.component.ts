// Angular
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit
} from '@angular/core';
// Blockframes
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
// RxJs
import { Observable } from 'rxjs';
import { startWith, map, debounceTime, switchMap, distinctUntilChanged, pluck, tap } from 'rxjs/operators';
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

  constructor(private movieQuery: MovieQuery, private dynTitle: DynamicTitleService) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Titles')
    this.movieSearchResults$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(() => this.filterForm.search()),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),

      // join retrieved movieIds from algolia with the movies from the state
      switchMap(movieIds => {
        // If empty get all the movies from akita
        if (!this.filterForm.isEmpty()) {
          return this.movieQuery.selectAll({
            filterBy: movie => movieIds.includes(movie.id),
            sortBy: (a, b) => sortMovieBy(a, b, this.sortByControl.value),
          })
        } else {
          return this.movieQuery.selectAll({
            sortBy: (a, b) => sortMovieBy(a, b, this.sortByControl.value)
          });
        }
      }),
      startWith(this.movieQuery.getAll())
    )
  }
}
