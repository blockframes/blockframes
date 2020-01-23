// Angular
import { Component, ChangeDetectionStrategy, Host, OnInit, OnDestroy } from '@angular/core';
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

const panels = [{
  title: 'Title Information',
  icon: 'document',
  routes: [{
    path: 'main',
    label: 'Main Informations'
  }, {
    path: 'synopsis',
    label: 'Synopsis'
  }, {
    path: 'credits',
    label: 'Credits'
  }, {
    path: 'budget',
    label: 'Budg., quota, critics',
  }, {
    path: 'technical-info',
    label: 'Technical info.'
  }, {
    path: 'keywords',
    label: 'Keywords'
  }]
}, {
  title: 'Licensed Rights',
  icon: 'mapMarker',
  routes: [{
    path: 'rights',
    label: 'Marketplace Rights'
  }, {
    path: 'deals',
    label: 'Previously Deals'
  }]
}, {
  title: 'Uploaded Media',
  icon: 'import',
  routes: [{
    path: 'images',
    label: 'Images'
  }, {
    path: 'files&links',
    label: 'Files & Links'
  }]
}, {
  title: 'Legal Information',
  icon: 'certificate',
  routes: [{
    path: 'chain',
    label: 'Chain of Titles'
  }, {
    path: 'evaluation',
    label: 'Marketplace Eval.'
  }]
}];

const allRoutes = panels.map(({ routes }) => routes.map(r => r.path));
const allPath = allRoutes.flat();


@Component({
  selector: 'catalog-layout',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements OnInit, OnDestroy {
  private sub: Subscription;
  public panels = panels;
  public pageData$ = this.routerQuery
    .select('state')
    .pipe(map(({ url }) => getPageData(url, allRoutes)));

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
      const movie = await this.service.getValue(movieId) // Edit movie
      this.form.patchValue(movie);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  /**
   * @description returns the next or previous page where the router should go to
   * @param current current url
   * @param arithmeticOperator plus or minus
   */
  private getPage(current: string, arithmeticOperator: number): string {
    const i: number = allPath.indexOf(current) + arithmeticOperator;
    if (i < 0) {
      return 'start';
    }
    return allPath[i];
  }

  // Should save movie, contract & deal
  private save() {
    // Movie
    this.form.value.id
      ? this.service.update(this.form.value)
      : this.service.add(this.form.value);
    // Contract

    // Deal

  }
}
