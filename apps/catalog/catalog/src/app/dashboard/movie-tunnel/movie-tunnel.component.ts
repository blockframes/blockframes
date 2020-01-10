import { Component, ChangeDetectionStrategy, Host } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';
import { MovieService } from '@blockframes/movie/movie/+state';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'catalog-layout',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MovieTunnelComponent {
  private sub: Subscription;
  public pages = [
    ['main', 'synopsis', 'credits', 'budget', 'technical-info', 'keywords'],
    ['rights', 'deals'],
    ['images', 'files&links'],
    ['chain', 'evaluation']
  ];

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

  get pageUrl() {
    return this.routerQuery.getValue().state.url.split('/').pop();
  }

  get pageData() {
    const panel = this.pages.find(page => page.includes(this.pageUrl));
    const index = panel.indexOf(this.pageUrl) + 1;
    const arrayLength = panel.length;
    return { index: index, length: arrayLength};
  }
}
