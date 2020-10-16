import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Observable, combineLatest, of, Subscription, BehaviorSubject } from 'rxjs';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { FormControl } from '@angular/forms';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'financiers-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private movieResultsState = new BehaviorSubject<Movie[]>([]);

  public movies$: Observable<Movie[]>;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['Title', 'Director' /* 'Production Year' #1146 */];

  public searchForm = new MovieSearchForm();

  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;
  private loadMoreToggle: boolean;
  private lastPage: boolean;

  public loading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private movieService: MovieService,
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
  ) { }

  ngOnInit() {
    this.dynTitle.setPageTitle('Films On Our Market Today');
    // Implicitly we only want accepted movies
    this.searchForm.storeConfig.add('accepted');
    // On financiers, we want only movie available for financiers
    this.searchForm.appAccess.add('financiers');
    this.movies$ = this.movieResultsState.asObservable();
    this.sub = combineLatest([
      this.sortByControl.valueChanges.pipe(startWith('Title')),
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value), distinctUntilChanged())
    ]).pipe(
      tap(() => this.loading$.next(true)),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.searchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),
      switchMap(ids => ids.length ? this.movieService.valueChanges(ids) : of([])),
      /*  map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))), */
    ).subscribe(movies => {
      if (this.loadMoreToggle) {
        this.movieResultsState.next(this.movieResultsState.value.concat(movies))
        this.loadMoreToggle = false;
      } else {
        this.movieResultsState.next(movies);
      }
      /* hitsViewed is just the current state of displayed orgs, this information is important for comparing
      the overall possible results which is represented by nbHits.
      If nbHits and hitsViewed are the same, we know that we are on the last page from the algolia index.
      So when the next valueChange is happening we need to reset everything and start from beginning  */
      this.hitsViewed = this.movieResultsState.value.length
      if (this.lastPage && this.searchForm.page.value !== 0) {
        this.hitsViewed = 0;
        this.searchForm.page.setValue(0);
      }
      this.lastPage = this.hitsViewed === this.nbHits;
      this.loading$.next(false)
    });;
  }

  clear() {
    const initial = createMovieSearch({ appAccess: ['financiers'], storeConfig: ['accepted'] });
    this.searchForm.reset(initial);
    this.cdr.markForCheck();
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
