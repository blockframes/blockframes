import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MovieTitleFormComponent } from '../../components/movie-title-form/movie-title-form.component';

@Component({
  selector: 'movie-movie-create',
  templateUrl: './movie-create.component.html',
  styleUrls: ['./movie-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCreateComponent {
  @HostBinding('attr.page-id') pageId = 'movie-create';

  constructor(private dialog: MatDialog) { }

  addNewMovie() {
    this.dialog.open(MovieTitleFormComponent)
  }
}
