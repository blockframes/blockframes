import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieTitleFormComponent } from '../../components/movie-title-form/movie-title-form.component';

import { MatDialog } from '@angular/material';

@Component({
  selector: 'movie-empty',
  templateUrl: './movie-empty.component.html',
  styleUrls: ['./movie-empty.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEmptyComponent {

  constructor(private dialog: MatDialog) {}

  public addNewMovie() {
    this.dialog.open(MovieTitleFormComponent);
  }

}
