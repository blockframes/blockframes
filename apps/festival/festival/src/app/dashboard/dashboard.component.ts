// Angular
import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';

// Algolia
import { Index } from 'algoliasearch';
import { MoviesIndex, MovieAlgoliaResult } from '@blockframes/utils/algolia';

// RxJs
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'festival-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  searchCtrl: FormControl = new FormControl('');

  ltMd$ = this.breakpointsService.ltMd;

  /**MovieAlgoliaResult Algolia search results */
  public algoliaSearchResults$: Observable<SearchResult[]>;

  constructor(
    private breakpointsService: BreakpointsService,
    @Inject(MoviesIndex) private movieIndex: Index
  ) {}

  ngOnInit() {
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
    return [{ title: 'Movies', icon: 'picture', path: 'titles', items: titles }]
  }
}
