import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { staticModels } from '@blockframes/utils/static-model';

@Component({
  selector: 'movie-form-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormArtisticComponent {
  form = this.shell.form;
  public castStatus = staticModels.CAST_STATUS;

  constructor(private shell: MovieFormShellComponent) {}

  get cast() {
    console.log('controles', this.salesCast.get('cast').controls);
    return this.salesCast.get('cast');
  }

  get salesCast() {
    console.log('controls', this.form.get('salesCast').controls);
    return this.form.get('salesCast');
  }

}
