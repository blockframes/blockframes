import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-keywords',
  templateUrl: './keywords.component.html',
  styleUrls: ['./keywords.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormKeywordsComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) { }

  get promotionalDescription() {
    return this.form.get('promotionalDescription');
  }
}
