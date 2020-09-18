import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-shooting-information',
  templateUrl: './shooting-information.component.html',
  styleUrls: ['./shooting-information.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormShootingInformationComponent {
  form = this.shell.form;

  constructor(private shell: MovieFormShellComponent) {}
}
