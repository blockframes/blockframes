import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormCreditsComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

  get main() {
    return this.form.get('main');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

}
