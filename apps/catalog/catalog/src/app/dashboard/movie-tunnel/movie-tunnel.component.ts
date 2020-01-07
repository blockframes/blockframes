import { Component, ChangeDetectionStrategy, Host } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieService } from '@blockframes/movie/+state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'catalog-layout',
  templateUrl: './movie-tunnel.component.html',
  styleUrls: ['./movie-tunnel.component.scss'],
  providers: [MovieForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class MovieTunnelComponent {
  private sub: Subscription;

  constructor(
    @Host() private form: MovieForm,
    private service: MovieService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.sub = this.route.params.subscribe(async ({ movieId }: { movieId: string }) => {
      const movie = movieId !== 'create'
        ? await this.service.getValue(movieId)  // Edit movie
        : {};                                   // Create movie
      this.form.patchValue(movie)
    })
  }
  
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
