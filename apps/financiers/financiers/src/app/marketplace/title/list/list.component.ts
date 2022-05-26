import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';

import { PdfService } from '@blockframes/utils/pdf/pdf.service'
import type { StoreStatus } from '@blockframes/model';
import { AlgoliaMovie } from '@blockframes/model';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'financiers-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

  private movieResultsState = new BehaviorSubject<AlgoliaMovie[]>(null);

  public movies$: Observable<AlgoliaMovie[]>;
  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('financiers', this.storeStatus);
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;

  private sub: Subscription;
  private loadMoreToggle: boolean;
  private lastPage: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private snackbar: MatSnackBar,
    private pdfService: PdfService
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  ngOnInit() {
    this.movies$ = this.movieResultsState.asObservable();

    const params = this.route.snapshot.queryParams;
    for (const key in params) {
      try {
        params[key].split(',').forEach(v => this.searchForm[key].add(v.trim()));
      } catch (_) {
        console.error(`Invalid parameter ${key} in URL`);
      }
    }

    this.sub =
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
        distinctUntilChanged(),
        debounceTime(500),
        switchMap(() => this.searchForm.search(true)),
        tap(res => this.nbHits = res.nbHits),
        pluck('hits')
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
      });
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus] });
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

  async export(movies: AlgoliaMovie[]) {
    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    await this.pdfService.download(movies.map(m => m.objectID));
    snackbarRef.dismiss();
    this.exporting = false;
  }
}
