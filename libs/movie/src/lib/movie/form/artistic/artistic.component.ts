import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';

@Component({
  selector: 'movie-form-artistic',
  templateUrl: './artistic.component.html',
  styleUrls: ['./artistic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFormArtisticComponent {
  form = this.shell.getForm('movie');

  public castColumns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    status: 'Status',
    description: 'Description',
    filmography: 'Filmography',
  }

  public crewColumns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    status: 'Status',
    role: 'Role',
    description: 'Description',
    filmography: 'Filmography',
  }


  constructor(private shell: MovieFormShellComponent) {}

  get crew() {
    return this.form.crew;
  }

  get cast() {
    return this.form.cast;
  }

}
