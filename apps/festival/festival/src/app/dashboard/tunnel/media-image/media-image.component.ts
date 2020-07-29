import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MoviePromotionalHostedMediaForm } from '@blockframes/movie/form/promotional-elements/promotional-elements.form';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'festival-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImageComponent {
  form = this.tunnel.form;

  public movieId = this.route.snapshot.params.movieId;

  constructor(
    private tunnel: MovieTunnelComponent,
    private route: ActivatedRoute,
  ) { }

  addStill() {
    this.form.promotionalElements
      .get('still_photo')
      .push(new MoviePromotionalHostedMediaForm());
  }

  trackByFn(index) {
    return index;
  }

}
