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
import { map, debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap, takeWhile, scan } from 'rxjs/operators';
import { sortMovieBy } from '@blockframes/utils/akita-helper/sort-movie-by'; // TODO issue #3584
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { PageEvent } from '@angular/material/paginator';
import { interval as observableInterval } from "rxjs";
import { MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private movieSearchResultsState = new BehaviorSubject<Movie[]>([]);
  public movieSearchResults$: Observable<Movie[]>;
  private sub: Subscription;
  public nbHits: number;
  public hitsViewed: number = 0;

  public sortByControl: FormControl = new FormControl('Title');
  public sortOptions: string[] = ['Title', 'Director' /* 'Production Year' #1146 */];

  public filterForm = new MovieSearchForm();

  constructor(
    private sidenavContainer: MatSidenavContainer,
    private sidenavContent: MatSidenavContent,
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

    this.movieSearchResults$ = this.movieSearchResultsState.asObservable();

    this.sub = combineLatest([
      this.sortByControl.valueChanges.pipe(startWith('Title')),
      this.filterForm.valueChanges.pipe(startWith(this.filterForm.value), distinctUntilChanged())
    ]).pipe(
      debounceTime(300),
      switchMap(() => this.filterForm.search()),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
      tap(console.log),
      tap(movies => this.hitsViewed = this.hitsViewed + movies.length),
      map(result => result.map(movie => movie.objectID)),
      switchMap(ids => ids.length ? this.movieService.valueChanges(ids) : of([])),
      // map(movies => movies.sort((a, b) => sortMovieBy(a, b, this.sortByControl.value))), // TODO issue #3584
      tap(movies => this.movieSearchResultsState.next(this.movieSearchResultsState.value.concat(movies))),
    ).subscribe();
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }

  clear() {
    const initial = createMovieSearch({ appAccess: ['festival'], storeConfig: ['accepted'] });
    this.filterForm.reset(initial);
    this.cdr.markForCheck();
  }

  pageEvent(event: PageEvent, el) {
    console.log('scrolling to top')
    this.sidenavContainer.scrollable.scrollTo({ start: 0, behavior: 'smooth' });
    this.sidenavContent.scrollTo({ behavior: 'smooth', start: 0 });
    this.sidenavContent.elementScrolled().subscribe(console.log);
    // this.scroller.scrollable.elementScrolled().subscribe(console.log);
    
    // window.scrollTo(0, 0);
    // this.scrollToElement(el);
    // this.filterForm.page.setValue(event.pageIndex);
    // this.filterForm.search();
  }

  // scrollToElement(el): void {
  //   const duration = 600;
  //   const interval = 5;
  //   const moveEl = el.scrollTop * interval / duration;

  //   console.log('wtf: ', el.scrollTop)
   
  //   observableInterval(interval).pipe(
  //     scan((acc, curr) => acc - moveEl, el.scrollTop),
  //     tap(position => el.scrollTop = position),
  //     takeWhile(val => val > 0)
  //   ).subscribe();
  // }

  loadMore() {
    this.filterForm.page.setValue(this.filterForm.page.value + 1);
    this.filterForm.search();
  }

  handler(ev) {
    console.log('ev: ', ev);
  }
  
}
