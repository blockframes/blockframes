import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

@Component({
  selector: 'catalog-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImageComponent {
  form = this.tunnel.form;

  public movie = this.movieQuery.getActive();

  constructor(
    private tunnel: MovieTunnelComponent,
    private movieQuery: MovieQuery,
    private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Promotional images', 'Title information');
  }

  get promotionalElements() {
    return this.form.get('promotionalElements')
  }

  get banner() {
    return this.form.main.banner;
  }

  get poster() {
    return this.form.main.poster;
  }

  get stillPhoto() {
    return this.promotionalElements.get('still_photo');
  }

  addStill() {
    this.form.promotionalElements
      .get('still_photo')
      .push(new HostedMediaForm());
  }

  trackByFn(index) {
    return index;
  }

}
