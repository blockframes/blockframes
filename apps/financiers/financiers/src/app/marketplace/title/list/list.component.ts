import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { Observable, of, Subscription, BehaviorSubject } from 'rxjs';
import { MovieService, Movie } from '@blockframes/movie/+state';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'financiers-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private movieResultsState = new BehaviorSubject<Movie[]>([]);

  public movies$: Observable<Movie[]>;

  public searchForm = new MovieSearchForm('financiers', { storeConfig: ['accepted'] });

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
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  ngOnInit() {
    // On financiers, we want only movie available for financiers
    this.movies$ = this.movieResultsState.asObservable();

    this.route.queryParams.subscribe(params => {
      Object.keys(params).forEach(k => {
        try {
          const values = params[k].split(',');
          values.forEach(v => this.searchForm[k].add(v.trim()));
        } catch (_) {
          this.snackBar.open('Invalid parameters in URL', 'close', { duration: 1000 });
        }
      });
    });

    this.sub =
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
        tap(() => this.loading$.next(true)),
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(() => this.searchForm.search()),
        tap(res => this.nbHits = res.nbHits),
        pluck('hits'),
        map(result => result.map(movie => movie.objectID)),
        switchMap((ids: string[]) => ids.length ? this.movieService.valueChanges(ids) : of([])),
      ).subscribe((movies: Movie[]) => {
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
