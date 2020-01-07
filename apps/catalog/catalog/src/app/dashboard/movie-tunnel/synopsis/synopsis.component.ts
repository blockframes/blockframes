import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: 'catalog-tunnel-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelSynopsisComponent {

  constructor(private form:MovieForm) { }

  get story() {
    return this.form.get('story');
  }

  get promotionalDescription() {
    return this.form.get('promotionalDescription');
  }
}
