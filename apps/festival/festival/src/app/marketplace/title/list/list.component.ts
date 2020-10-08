import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Observable, combineLatest, of, BehaviorSubject, Subscription } from 'rxjs';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { FormControl } from '@angular/forms';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';
// import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by'; // TODO issue #3584
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { CdkScrollable } from '@angular/cdk/overlay';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  public movieSearchResultsState = new BehaviorSubject<Movie[]>([]);
  public movies$: Observable<Movie[]>;
  private sub: Subscription;
  public nbHits: number;
  public hitsViewed = 0;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['Title', 'Director' /* 'Production Year' #1146 */];

  public searchForm = new MovieSearchForm();

  private scrollOffsetTop: number;
  private loadingMore = true;

  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private scrollable: CdkScrollable
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Films On Our Market Today');
    // Implicitly we only want accepted movies
    this.searchForm.storeConfig.add('accepted');
    // On festival, we want only movie available for festival
    this.searchForm.appAccess.add('festival');

    this.movies$ = this.movieSearchResultsState.asObservable();

    this.sub = combineLatest([
      this.sortByControl.valueChanges.pipe(startWith('Title')),
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value), distinctUntilChanged())
    ]).pipe(
      debounceTime(300),
      switchMap(() => this.searchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),
      switchMap(ids => ids.length ? this.movieService.valueChanges(ids) : of([])),
      // map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))), // TODO issue #3584
      tap(movies => {
        if (this.loadingMore) {
          this.movieSearchResultsState.next(this.movieSearchResultsState.value.concat(movies));
          this.hitsViewed += movies.length;
          this.loadingMore = false;
        } else {
          this.movieSearchResultsState.next(movies);
          this.hitsViewed = movies.length;
        }
      }),
      tap(_ => setTimeout(() => this.scrollToScrollOffset(), 0))
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  clear() {
    const initial = createMovieSearch({ appAccess: ['festival'], storeConfig: ['accepted'] });
    this.searchForm.reset(initial);
    this.cdr.markForCheck();
  }

  async loadMore() {
    this.loadingMore = true;
    this.setScrollOffset();
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  setScrollOffset() {
    this.scrollOffsetTop = this.scrollable.measureScrollOffset('top');
  }

  scrollToScrollOffset() {
    this.scrollable.scrollTo({ top: this.scrollOffsetTop });
  }
}
