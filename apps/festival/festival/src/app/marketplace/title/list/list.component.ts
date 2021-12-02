import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { Movie } from '@blockframes/movie/+state';
import { MovieSearchForm, createMovieSearch, MovieSearch } from '@blockframes/movie/form/search.form';
import { debounceTime, switchMap, pluck, startWith, distinctUntilChanged, tap } from 'rxjs/operators';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { ActivatedRoute, Router } from '@angular/router';
import { StoreStatus } from '@blockframes/utils/static-model/types';
import { decodeUrl, encodeUrl } from "@blockframes/utils/form/form-state-url-encoder";
import { AlgoliaMovie } from '@blockframes/utils/algolia';
import { HttpClient } from '@angular/common/http';
import { firebaseRegion, firebase } from '@env';
import { toStorageFile } from '@blockframes/media/pipes/storageFile.pipe';
import { getImgIxResourceUrl } from '@blockframes/media/image/directives/imgix-helpers';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { getCurrentApp } from '@blockframes/utils/apps';
import { MatSnackBar } from '@angular/material/snack-bar';
export const { projectId } = firebase();

@Component({
  selector: 'festival-marketplace-title-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy, AfterViewInit {

  private movieResultsState = new BehaviorSubject<Movie[]>(null);

  public movies$: Observable<Movie[]>;
  public storeStatus: StoreStatus = 'accepted';
  public searchForm = new MovieSearchForm('festival', this.storeStatus);
  public exporting = false;
  public nbHits: number;
  public hitsViewed = 0;

  private subs: Subscription[] = [];
  private loadMoreToggle: boolean;
  private lastPage: boolean;

  constructor(
    private dynTitle: DynamicTitleService,
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private routerQuery: RouterQuery,
    private snackbar: MatSnackBar
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

    const sub = this.searchForm.valueChanges.pipe(startWith(this.searchForm.value),
      distinctUntilChanged(),
      debounceTime(500),
      switchMap(() => this.searchForm.search(true)),
      tap(res => this.nbHits = res.nbHits),
      pluck('hits'),
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
    this.subs.push(sub);
  }

  ngAfterViewInit(): void {
    const decodedData: MovieSearch = decodeUrl(this.route);
    if (decodedData && Object.keys(decodedData).length) this.searchForm.hardReset(decodedData)

    const sub = this.searchForm.valueChanges.pipe(
      debounceTime(1000),
    ).subscribe(value => encodeUrl<MovieSearch>(this.router, this.route, value));
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

  async export(movies: AlgoliaMovie[]) {
    const snackbarRef = this.snackbar.open('Please wait, your export is being generated...');
    this.exporting = true;
    const app = getCurrentApp(this.routerQuery);
    const params = {
      titlesData: movies.map(m => {
        const storageFile = toStorageFile(m.poster, 'movies', 'poster', m.objectID);
        const posterUrl = getImgIxResourceUrl(storageFile, { h: 240, w: 180 });
        return {
          id: m.objectID,
          posterUrl
        };
      }),
      app
    };

    //const url = `https://${firebaseRegion}-${projectId}.cloudfunctions.net/createPdf`;
    const url = `http://localhost:5001/${projectId}/${firebaseRegion}/createPdf`;// @TODO #7045 remove 

    await new Promise(resolve => {
      this.http.post(url, params, { responseType: 'arraybuffer' })
        .toPromise().then(response => {
          const type = 'application/pdf';
          const buffer = new Uint8Array(response);
          const blob = new Blob([buffer], { type });
          const url = URL.createObjectURL(blob);
          const element = document.createElement('a');
          element.setAttribute('href', url);
          element.setAttribute('download', `export.pdf`);
          const event = new MouseEvent('click');
          element.dispatchEvent(event);
          resolve(true);
        });
    });

    snackbarRef.dismiss();
    this.exporting = false;
  }
}
