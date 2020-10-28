// Angular
import { FormControl } from '@angular/forms';
import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef, OnDestroy
} from '@angular/core';

// Blockframes
import { Movie, MovieService } from '@blockframes/movie/+state';

// RxJs
import { Observable, combineLatest, of, BehaviorSubject, Subscription } from 'rxjs';
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';

// Others
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private movieResultsState = new BehaviorSubject<Movie[]>([]);

  public movies$: Observable<Movie[]>;

  public searchForm = new MovieSearchForm('catalog', { storeConfig: ['accepted'] });

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
    this.movies$ = this.movieResultsState.asObservable();
    this.sub = this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
      tap(() => this.loading$.next(true)),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.searchForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      map(result => result.map(movie => movie.objectID)),
      switchMap(ids => ids.length ? this.movieService.valueChanges(ids) : of([])),
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
    const initial = createMovieSearch({ storeConfig: ['accepted'] });
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
