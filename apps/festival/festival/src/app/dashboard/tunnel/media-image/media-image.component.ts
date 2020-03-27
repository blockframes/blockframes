import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'catalog-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImageComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private movieQuery: MovieQuery) {}

  public movie = this.movieQuery.getActive();
  public bannerPath = `movie/${this.movie.id}/Banner`;
  public posterPath = `movie/${this.movie.id}/Poster`;
  public stillPath = `movie/${this.movie.id}/Still`;

  get promotionalElements() {
    return this.form.get('promotionalElements')
  }

  get banner() {
    return this.promotionalElements.get('banner');
  }

  get poster() {
    return this.promotionalElements.get('poster');
  }

  get stillPhoto() {
    return this.promotionalElements.get('still_photo');
  }

}
