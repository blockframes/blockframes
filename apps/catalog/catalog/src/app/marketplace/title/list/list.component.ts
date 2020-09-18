// Angular
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

// Blockframes
import { MovieService } from '@blockframes/movie/+state';

// RxJs
import { Observable, combineLatest, of } from 'rxjs';
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged } from 'rxjs/operators';

// Others
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  public movieSearchResults$: Observable<any>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['All films', 'Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new MovieSearchForm();

  constructor(private movieService: MovieService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
    // Implicitly we only want accepted movies
    this.filterForm.storeConfig.add('accepted');
    // On catalog, we want only movie available for catalog
    this.filterForm.appAccess.add('catalog');
    this.movieSearchResults$ = combineLatest([
      this.sortByControl.valueChanges.pipe(startWith('Title')),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value), distinctUntilChanged())
    ]).pipe(
      debounceTime(300),
      switchMap(() => this.filterForm.search()),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),
      switchMap(ids => ids.length ? this.movieService.valueChanges(ids) : of([])),
      map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))),
    );
  }

  clear() {
    const initial = createMovieSearch({ appAccess: ['catalog'], storeConfig: ['accepted'] });
    this.filterForm.reset(initial);
    this.cdr.markForCheck();
  }
}
