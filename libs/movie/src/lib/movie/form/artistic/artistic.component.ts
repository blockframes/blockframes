import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Filmography } from '@blockframes/model';
import { displayFilmographies } from '@blockframes/movie/pipes/filmography.pipe';
import { CellModalComponent } from '@blockframes/ui/cell-modal/cell-modal.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
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

  constructor(
    private shell: MovieFormShellComponent,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
  ) {
    this.dynTitle.setPageTitle('Artistic Team')
  }

  get crew() {
    return this.form.crew;
  }

  get cast() {
    return this.form.cast;
  }

  //TODO #6507
  openDetails(title: string, values: string | Filmography[]) {
    const arrayValues = Array.isArray(values) ? displayFilmographies(values) : values;
    this.dialog.open(CellModalComponent, {
      data: { title, values: arrayValues },
      maxHeight: '80vh',
      minWidth: '50vw',
      maxWidth: '80vw',
      minHeight: '50vh',
      autoFocus: false,
    });
  }
}
