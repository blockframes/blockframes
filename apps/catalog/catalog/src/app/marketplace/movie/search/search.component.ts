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
import { Observable, combineLatest, of } from 'rxjs';
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
    // Implicitly we only want accepted movies
    this.filterForm.storeConfig.add('accepted');
    // On festival, we want only movie available for catalog
    this.filterForm.appAccess.add('catalog');
    this.dynTitle.setPageTitle('Titles')
    this.movies$ = this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(this.filterForm.value),
      switchMap(_ => this.filterForm.search()),
      pluck('hits'),
      map(results => results.map(movie => movie.objectID)),
      /* We want to return an empty array if the user type something we cant find a match for */
      switchMap(movieIds => movieIds.length ? this.movieService.valueChanges(movieIds) : of([]))
    );
    const sortBy$ = this.sortByControl.valueChanges.pipe(
      startWith(this.sortByControl.value)
    );
    this.movieSearchResults$ = combineLatest([movies$, sortBy$]).pipe(
      map(([movies, sortBy]) => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))
      )
    )
  }
}
