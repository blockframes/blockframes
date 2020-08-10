import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { ActivatedRoute } from '@angular/router';
import { HostedMediaForm } from '@blockframes/media/form/media.form';

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
      .push(new HostedMediaForm());
  }

  trackByFn(index) {
    return index;
  }

}
