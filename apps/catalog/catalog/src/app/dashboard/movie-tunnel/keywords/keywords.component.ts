import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieForm } from '@blockframes/movie/form/movie.form';

@Component({
  selector: 'catalog-tunnel-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TunnelKeywordsComponent {

  constructor(private form: MovieForm) { }

  get promotionalDescription() {
    return this.form.get('promotionalDescription');
  }
}
