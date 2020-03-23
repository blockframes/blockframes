import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-movie-tunnel-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreditsComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private title: Title) {
    this.title.setTitle('Credits - Title information - Archipel Content')
   }

  get main() {
    return this.form.get('main');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

}
