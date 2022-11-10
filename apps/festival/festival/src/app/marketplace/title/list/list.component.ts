import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, tap } from 'rxjs/operators';

import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import { StoreStatus, AlgoliaMovie, MovieSearch, MovieAvailsSearch } from '@blockframes/model';
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy, AfterViewInit {

  private movieResultsState = new BehaviorSubject<AlgoliaMovie[]>(null);

  public movies$: Observable<AlgoliaMovie[]>;
  private movieIds: string[] = [];
  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('festival', this.storeStatus);
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;

  private subs: Subscription[] = [];
  private loadMoreToggle: boolean;
  private previousSearch: string;

  constructor(
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar,
    private pdfService: PdfService,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  ngOnInit() {
    this.movies$ = this.movieResultsState.asObservable();

    const sub = this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      tap(() => {
        const search: MovieSearch = { ...this.searchForm.value };
        delete search.page;
        const currentSearch = JSON.stringify(search);
        if (this.previousSearch !== currentSearch && this.searchForm.page.value !== 0) {
          this.searchForm.page.setValue(0, { onlySelf: false, emitEvent: false });
          encodeUrl<MovieAvailsSearch>(this.router, this.route, { search: this.searchForm.value });
        }
        this.previousSearch = currentSearch;
      }),
      switchMap(async () => [await this.searchForm.search(true), await this.searchForm.search(true, { hitsPerPage: this.pdfService.exportLimit, page: 0 })]),
      tap(([res]) => this.nbHits = res.nbHits),
    ).subscribe(([movies, moviesToExport]) => {
      this.movieIds = moviesToExport.hits.map(m => m.objectID);
      if (this.loadMoreToggle) {
        this.movieResultsState.next(this.movieResultsState.value.concat(movies.hits));
        this.loadMoreToggle = false;
      } else {
        this.movieResultsState.next(movies.hits);
      }
      this.hitsViewed = this.movieResultsState.value.length;
    });
    this.subs.push(sub);
  }

  ngAfterViewInit(): void {
    const decodedData = decodeUrl<MovieAvailsSearch>(this.route);
    this.load(decodedData);

    const sub = this.searchForm.valueChanges.pipe(
      debounceTime(1000),
    ).subscribe(search => encodeUrl<MovieAvailsSearch>(this.router, this.route, { search }));
    this.subs.push(sub);
  }

  clear() {
    const initial = createMovieSearch({ storeStatus: [this.storeStatus] });
    this.searchForm.reset(initial);
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  ngOnDestroy() {
    this.subs.forEach(element => element.unsubscribe());
  }

  async export() {
    if (this.movieIds.length >= this.pdfService.exportLimit) {
      this.snackbar.open('Sorry, you can\'t have an export with that many titles.', 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    const exportStatus = await this.pdfService.download({ titleIds: this.movieIds, forms: { search: this.searchForm } });
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
  }

  load(savedSearch: MovieAvailsSearch) {
    if (savedSearch?.search && Object.keys(savedSearch.search).length) {
      this.searchForm.hardReset(createMovieSearch({ ...savedSearch.search, storeStatus: [this.storeStatus] }));
    }
  }
}
