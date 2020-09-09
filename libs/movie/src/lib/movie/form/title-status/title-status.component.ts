// Angular
import { Component, ChangeDetectionStrategy, } from '@angular/core';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-title-status',
  templateUrl: 'title-status.component.html',
  styleUrls: ['./title-status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleStatusComponent {
  public form = this.shell.form;
  constructor(private shell: MovieFormShellComponent) { }
}