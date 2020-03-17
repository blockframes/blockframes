// Angular
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Algolia
import { MovieAlgoliaResult } from '@blockframes/utils/algolia';

import { SearchResult } from '@blockframes/ui/search-widget/search-widget.component';
import { BreakpointsService } from '@blockframes/utils/breakpoint/breakpoints.service';
import { algolia } from '@env';

@Component({
  selector: 'catalog-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutComponent {
  searchCtrl: FormControl = new FormControl('');

  ltMd$ = this.breakpointsService.ltMd;

  public movieIndex = algolia.indexNameMovies

  constructor(
    private breakpointsService: BreakpointsService,
    private router: Router,
    private route: ActivatedRoute) { }

  /**
   * @description helps to transform algolia search results to search results
   * @param results that you get back from algolia
   */
  private toSearchResult(results: MovieAlgoliaResult[]): SearchResult[] {
    const titles = results.map(result => ({ id: result.objectID, value: result.movie.main.title.original }));
    return [{ title: 'Movies', icon: 'picture', path: 'titles', items: titles }]
  }

  public navigate(id: string) {
    this.router.navigate(['titles', id], { relativeTo: this.route })
  }
}
