import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'catalog-tunnel-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelSynopsisComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private title: Title) {
    this.title.setTitle('Storyline Elements - Title information - Archipel Content')
  }

  get synopsis() {
    return this.form.get('story').get('synopsis');
  }

  get keyAssets() {
    return this.form.get('promotionalDescription').get('keyAssets');
  }

  get keywords() {
    return this.form.get('promotionalDescription').get('keywords');
  }
}
