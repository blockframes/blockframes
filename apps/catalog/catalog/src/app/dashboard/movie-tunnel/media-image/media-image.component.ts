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
  }// TODO MF, PROBLEM IS REGISTER ON CHANGE ON THE DROPZONE COMPONENT, DOENST WORK WITH ARRAY OR FORMGROUP?

  public movie = this.movieQuery.getActive();
  public bannerPath = `movies/${this.movie.id}/promotionalElements.banner.media`;
  public posterPath = `movies/${this.movie.id}/promotionalElements.poster.0.media`;
  public stillPath = `movies/${this.movie.id}/promotionalElements.still_photo.0.media`;

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
