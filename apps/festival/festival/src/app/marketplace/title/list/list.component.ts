import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { FormControl } from '@angular/forms';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged } from 'rxjs/operators';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit {

  public movieSearchResults$: Observable<Movie[]>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new MovieSearchForm();

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Films On Our Market Today');
    // Implicitly we only want accepted movies
    this.filterForm.storeConfig.add('accepted');
    // On festival, we want only movie available for festival
    this.filterForm.appAccess.add('festival');
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
    const initial = createMovieSearch({ appAccess: ['festival'], storeConfig: ['accepted'] });
    this.filterForm.reset(initial);
    this.cdr.markForCheck();
  }
}
