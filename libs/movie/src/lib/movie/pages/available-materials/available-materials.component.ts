import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-available-materials',
  templateUrl: './available-materials.component.html',
  styleUrls: ['./available-materials.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormAvailableMaterialscComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) {}

  get version() {
    return this.form.get('versionInfo');
  }

  get hasKeys() {
    return Object.keys(this.version.controls).length;
  }

}
