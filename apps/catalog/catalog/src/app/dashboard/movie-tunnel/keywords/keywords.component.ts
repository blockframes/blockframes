import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';

@Component({
  selector: 'catalog-tunnel-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelKeywordsComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent) { }

  get promotionalDescription() {
    return this.form.get('promotionalDescription');
  }
}
