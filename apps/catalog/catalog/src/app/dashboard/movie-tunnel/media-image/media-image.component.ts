import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImageComponent {
  form = this.tunnel.form;

  constructor(
    private tunnel: MovieTunnelComponent,
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Promotional images', 'Title information')
  }

  public movie = this.movieQuery.getActive();
  public bannerPath = `movie/${this.movie.id}/banner`;
  public posterPath = `movie/${this.movie.id}/poster`;
  public stillPath = `movie/${this.movie.id}/still`;

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
