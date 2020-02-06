// Angular
import { FormControl } from '@angular/forms';
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';

// Algolia
import { Index } from 'algoliasearch';
import { MoviesIndex, MovieAlgoliaResult } from '@blockframes/utils/algolia';

// RxJs
import { Observable } from 'rxjs';
import {
  map,
  shareReplay,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith
} from 'rxjs/operators';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  searchCtrl: FormControl = new FormControl('');
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(result => result.matches),
    shareReplay()
  );

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    @Inject(MoviesIndex) private movieIndex: Index
  ) {
    this.algoliaSearchResults$ = this.searchCtrl.valueChanges.pipe(
      startWith(this.searchCtrl.value),
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(searchText => {
        // TODO #1829 try bindCallback
        return new Promise<MovieAlgoliaResult[]>((res, rej) => {
          this.movieIndex.search(searchText, (err, result) => (err ? rej(err) : res(result.hits)));
        }).then(results => this.toSearchResult(results));
      })
    );
  }

  /**
   * @description helps to transform algolia search results to search results
   * @param results that you get back from algolia
   */
  private toSearchResult(results: MovieAlgoliaResult[]): SearchResult[] {
    const titles = results.map(result => ({ id: result.objectID, value: result.movie.main.title.original }));
    return [{ title: 'Movies', icon: 'picture', items: titles }]
  }
}
