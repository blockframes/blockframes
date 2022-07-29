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
import { debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';

import { PdfService } from '@blockframes/utils/pdf/pdf.service';
import type { StoreStatus } from '@blockframes/model';
import { AlgoliaMovie } from '@blockframes/model';
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MovieSearchForm, createMovieSearch, MovieSearch } from '@blockframes/movie/form/search.form';

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent {

  public movies: AlgoliaMovie[];
  public storeStatus: StoreStatus = 'accepted';
  public searchForm: MovieSearchForm;
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;
  private loadMoreToggle: boolean;
  private lastPage: boolean;
  private loadMoreFunction: () => any;
  constructor(
    private dynTitle: DynamicTitleService,
    private snackbar: MatSnackBar,
    private pdfService: PdfService,
  ) {
    this.dynTitle.setPageTitle('Films On Our Market Today');
  }

  async export(movies: AlgoliaMovie[]) {
    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    await this.pdfService.download(movies.map(m => m.objectID));
    snackbarRef.dismiss();
    this.exporting = false;
  }

  test(e: any) {
    this.movies = e.movies;
    this.searchForm = e.searchForm;
    this.nbHits = e.nbHits;
    this.lastPage = e.lastPage;
    this.hitsViewed = e.hitsViewed;
    this.loadMoreToggle = e.loadMoreToggle;
    this.loadMoreFunction = e.loadMore;
  }

  loadMore() {
    this.loadMoreFunction();
  }

}
