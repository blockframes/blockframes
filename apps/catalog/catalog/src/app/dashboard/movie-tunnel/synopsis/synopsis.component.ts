import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTunnelComponent } from '../movie-tunnel.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-tunnel-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelSynopsisComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieTunnelComponent, private dynTitle: DynamicTitleService) {
    this.dynTitle.setPageTitle('Storyline Elements', 'Title information')
  }

  // get synopsis() {
  //   return this.form.get('story').get('synopsis');
  // }

  // get keyAssets() {
  //   return this.form.get('promotionalDescription').get('keyAssets');
  // }

  // get keywords() {
  //   return this.form.get('promotionalDescription').get('keywords');
  // }
}
