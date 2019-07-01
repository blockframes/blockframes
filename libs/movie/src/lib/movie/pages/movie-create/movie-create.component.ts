import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MovieTitleFormComponent } from '../../components/movie-title-form/movie-title-form.component';

@Component({
  selector: 'movie-movie-create',
  templateUrl: './movie-create.component.html',
  styleUrls: ['./movie-create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieCreateComponent {

  constructor(private dialog: MatDialog) { }

  addNewMovie() {
    this.dialog.open(MovieTitleFormComponent)
  }
}
