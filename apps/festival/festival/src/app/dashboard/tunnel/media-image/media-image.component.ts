import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MoviePromotionalImageForm } from '@blockframes/movie/form/promotional-elements/promotional-elements.form';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'festival-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImageComponent {
  form = this.tunnel.form;

  public movie = this.movieQuery.getActive();

  constructor(private tunnel: MovieTunnelComponent, private movieQuery: MovieQuery) {}

  addStill() {
    this.form.promotionalElements
      .get('still_photo')
      .push(new MoviePromotionalImageForm({ label: 'Still' }));
  }

}
