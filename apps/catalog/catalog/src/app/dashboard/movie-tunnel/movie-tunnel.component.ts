import { Component, ChangeDetectionStrategy, Host } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { MovieService } from '@blockframes/movie/movie/+state';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterQuery } from '@datorama/akita-ng-router-store';

function getPageData(url: string, array: string[][]) {
  const pageUrl = url.split('/').pop();
  const panel = array.find(page => page.includes(pageUrl));
  const index = panel.indexOf(pageUrl) + 1;
  const arrayLength = panel.length;
  return { index: index, length: arrayLength};
}

interface PageData {
  index: number;
  length: number;
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
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MovieTunnelComponent {
  private sub: Subscription;
  public pageData$ = this.routerQuery.select('state').pipe(
    map( ({url}) => getPageData(url, pages))
  );;

  constructor(
    @Host() private form: MovieForm,
    private service: MovieService,
    private route: ActivatedRoute,
    private routerQuery: RouterQuery
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(async ({ movieId }: { movieId: string }) => {
      const movie = movieId !== 'create'
        ? await this.service.getValue(movieId)  // Edit movie
        : {};                                   // Create movie
      this.form.patchValue(movie)
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}


