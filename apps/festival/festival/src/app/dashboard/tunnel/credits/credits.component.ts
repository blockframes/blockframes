import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'festival-movie-tunnel-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent) { }

  get main() {
    return this.form.get('main');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

  get production() {
    return this.form.get('production');
  }

}
