import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'catalog-movie-tunnel-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TunnelMainComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent) {}

  get main() {
    return this.form.get('main');
  }

  get distributors() {
    return this.main.get('stakeholders').get('distributor');
  }

  get salesInfo() {
    return this.form.get('salesInfo');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

  get festivalPrizes() {
    return this.form.get('festivalPrizes');
  }
}
