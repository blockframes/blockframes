import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/movie/form/movie.form';

@Component({
  selector: 'catalog-tunnel-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelSynopsisComponent {

  constructor(private form:MovieForm) { }

  get synopsis() {
    return this.form.get('story').get('synopsis');
  }

  get keyAssets() {
    return this.form.get('promotionalDescription').get('keyAssets');
  }
}
