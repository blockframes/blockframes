import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) {}

  get main() {
    return this.form.get('main');
  }

  get distributors() {
    return this.production.get('stakeholders').get('distributor');
  }

  get salesInfo() {
    return this.form.get('salesInfo');
  }

  get production() {
    return this.form.get('production');
  }

  get salesCast() {
    return this.form.get('salesCast');
  }

  get festivalPrizes() {
    return this.form.get('festivalPrizes');
  }
}
