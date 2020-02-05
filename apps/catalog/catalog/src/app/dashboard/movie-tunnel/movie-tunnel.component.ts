// Angular
import { Component, ChangeDetectionStrategy, Host, OnInit } from '@angular/core';

// Akita
import { RouterQuery } from '@datorama/akita-ng-router-store';

// Blockframes
import { MovieService, MovieQuery } from '@blockframes/movie/movie/+state';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

// RxJs
import { map } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { MovieTunnelService } from './movie-tunnel.service';

interface PageData {
  index: number;
  length: number;
}

const panels = [{
  title: 'Title Information',
  icon: 'document',
  time: 27,
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
  icon: 'map_marker',
  time: 15,
  routes: [{
    path: 'rights',
    label: 'Marketplace Rights'
  }, {
    path: 'deals',
    label: 'Ongoing Deals'
  }]
}, {
  title: 'Uploaded Media',
  icon: 'import',
  time: 12,
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
  time: 5,
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

/**
 * Set the position of the page on the current panel
 * @example { index: 1, length: 3 } will look like 1/3 in the UI
 */
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

/**
 * @description returns the next or previous page where the router should go to
 * @param current current url
 * @param arithmeticOperator plus or minus
 */
function getPage(url: string, arithmeticOperator: number): string {
  const current = url.split('/').pop();
  const i: number = allPath.indexOf(current) + arithmeticOperator;
  return allPath[i];
}

@Component({
  selector: 'catalog-movie-tunnel',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTunnelComponent implements OnInit {
  private url$ = this.routerQuery.select(({ state }) => state.url);
  public routeBeforeTunnel: string;
  public panels = panels;
  
  public next$ = this.url$.pipe(map(url => getPage(url, 1)));
  public previous$ = this.url$.pipe(map(url => getPage(url, -1)));
  public pageData$ = this.url$.pipe(map(url => getPageData(url, allRoutes)));


  constructor(
    @Host() private form: MovieForm,
    private tunnelService: MovieTunnelService,
    private service: MovieService,
    private query: MovieQuery,
    private routerQuery: RouterQuery,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.routeBeforeTunnel = this.tunnelService.previousUrl;
    const movie = this.query.getActive();
    this.form.patchAllValue(movie);
  }

  // Should save movie
  public async save() {
    const id = this.query.getActiveId();
    await this.service.update({ id, ...this.form.value });
    this.snackBar.open('Saved', 'close', { duration: 500 });
  }

}
