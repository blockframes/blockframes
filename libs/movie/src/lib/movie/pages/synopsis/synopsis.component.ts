import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'mvoie-form-synopsis',
  templateUrl: './synopsis.component.html',
  styleUrls: ['./synopsis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormSynopsisComponent {
  form = this.tunnel.form;

  constructor(private tunnel: MovieFormShellComponent) { }

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
