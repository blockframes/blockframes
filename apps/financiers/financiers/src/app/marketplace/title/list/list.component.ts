import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ChangeDetectorRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription, BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap, startWith, distinctUntilChanged, tap } from 'rxjs/operators';

import { DownloadSettings, PdfService } from '@blockframes/utils/pdf.service';
import type { MovieAvailsSearch, StoreStatus } from '@blockframes/model';
import { AlgoliaMovie, MovieSearch } from '@blockframes/model';
import { MovieSearchForm, createMovieSearch } from '@blockframes/movie/form/search.form';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";

@Component({
  selector: 'financiers-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy, AfterViewInit {

  private movieResultsState = new BehaviorSubject<AlgoliaMovie[]>(null);

  public movies$: Observable<AlgoliaMovie[]>;
  private movieIds: string[] = [];
  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('financiers', this.storeStatus);
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;

  private loadMoreToggle: boolean;
  private previousSearch: string;
  private subs: Subscription[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
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

    const sub =
      this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
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
    this.cdr.markForCheck();
  }

  async loadMore() {
    this.loadMoreToggle = true;
    this.searchForm.page.setValue(this.searchForm.page.value + 1);
    await this.searchForm.search();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  async export() {
    const downloadSettings: DownloadSettings = { titleIds: this.movieIds };
    const canDownload = this.pdfService.canDownload(downloadSettings);

    if (!canDownload.status) {
      this.snackbar.open(canDownload.message, 'close', { duration: 5000 });
      return;
    }

    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    const exportStatus = await this.pdfService.download(downloadSettings);
    snackbarRef.dismiss();
    if (!exportStatus) {
      this.snackbar.open('The export you want has too many titles. Try to reduce your research.', 'close', { duration: 5000 });
    }
    this.exporting = false;
  }

  load(savedSearch: MovieAvailsSearch) {
    this.searchForm.hardReset(createMovieSearch({ ...savedSearch.search, storeStatus: [this.storeStatus] }));
  }
}
