// Lodash
import flatten from 'lodash/flatten';

// Angular
import { Component, ChangeDetectionStrategy, Host, OnInit, OnDestroy } from '@angular/core';
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { ContractForm } from '@blockframes/contract/forms/contract.form';
import { ActivatedRoute } from '@angular/router';

// Akita
import { RouterQuery } from '@datorama/akita-ng-router-store';

// Blockframes
import { MovieService } from '@blockframes/movie/movie/+state';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

// RxJs
import { map } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

interface PageData {
  index: number;
  length: number;
}

function getPageData(url: string, array: string[][]): PageData {
  const pageUrl = url.split('/').pop();
  const panel = array.find(page => page.includes(pageUrl));
  if (panel) {
    const index = panel.indexOf(pageUrl) + 1;
    const arrayLength = panel.length;
    return { index: index, length: arrayLength };
  } else {
    return { index: 0, length: 0 };
  }
}

// This table has to be synced with the routes, it allows the steps to be updated depending of the routes
// See movie-tunnel-routing.module.ts to synchronize the table
const pages = [
  ['main', 'synopsis', 'credits', 'budget', 'technical-info', 'keywords'],
  ['rights', 'deals'],
  ['images', 'files&links'],
  ['chain', 'evaluation']
];

@Component({
  selector: 'catalog-layout',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm, ContractForm, DistributionDealForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  public pageData$ = this.routerQuery
    .select('state')
    .pipe(map(({ url }) => getPageData(url, pages)));

  public next$: Observable<string> = this.routerQuery.select('state').pipe(
    map(state => {
      const url = state.url.split('/').pop();
      return this.getPage(url, 1);
    })
  );
  public previous$: Observable<string> = this.routerQuery.select('state').pipe(
    map(state => {
      const url = state.url.split('/').pop();
      return this.getPage(url, -1);
    })
  );

  constructor(
    @Host() private form: MovieForm,
    private service: MovieService,
    private route: ActivatedRoute,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(async ({ movieId }: { movieId: string }) => {
      const movie =
        movieId !== 'create'
          ? await this.service.getValue(movieId) // Edit movie
          : {}; // Create movie
      this.form.patchValue(movie);
    });
  }

  private getPage(current: string, arithmeticOperator: number): string {
    const flat: string[] = flatten(pages);
    const i: number = flat.indexOf(current) + arithmeticOperator;
    if (i < 0) {
      return 'start';
    }
    return flat[i];
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
