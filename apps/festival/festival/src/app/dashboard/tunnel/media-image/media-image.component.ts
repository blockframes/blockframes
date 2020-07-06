import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { HostedMediaForm } from '@blockframes/media/directives/media/media.form';

@Component({
  selector: 'festival-tunnel-media-image',
  templateUrl: './media-image.component.html',
  styleUrls: ['./media-image.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MediaImageComponent {
  form = this.tunnel.form;

  posterForms: HostedMediaForm[] = [];

  stillForms: HostedMediaForm[] = [];

  constructor(private tunnel: MovieTunnelComponent, private movieQuery: MovieQuery) {}

  public movie = this.movieQuery.getActive();

  get promotionalElements() {
    return this.form.get('promotionalElements')
  }

  // ngOnInit() {
  //   this.posterForms = Object.keys(this.posterFormRecord.controls).map(key => this.posterFormRecord.get(key) as HostedMediaForm);
  //   this.stillForms = Object.keys(this.stillPhotoFormRecord.controls).map(key => this.stillPhotoFormRecord.get(key) as HostedMediaForm);
  // }

}
