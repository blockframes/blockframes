import { Component, ChangeDetectionStrategy, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService } from '../../+state';
import { Router } from '@angular/router';
import { appsRoute } from '@blockframes/utils/routes';
import { App } from '@blockframes/utils/apps';

@Component({
  selector: 'movie-title-form',
  templateUrl: './movie-title-form.component.html',
  styleUrls: ['./movie-title-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTitleFormComponent {
  @HostBinding('attr.page-id') pageId = 'movie-title-form';

  constructor(
    private dialogRef: MatDialogRef<MovieTitleFormComponent>,
    private snackBar: MatSnackBar,
    private service: MovieService,
    private router: Router,
  ) { }

  public async newMovie(movieName: string) {
    if (!movieName) {
      this.snackBar.open('Invalid form', 'close', { duration: 1000 });
      return
    }
    try {
      this.snackBar.open('Movie created! Redirecting..', 'close', { duration: 3000 });
      const movie = await this.service.addMovie(movieName);

      this.router.navigate([`${appsRoute}/${App.mediaDelivering}/home/${movie.id}/edit`]);
      // TODO: Find out why { relativeTo: this.route } is not working as intended.
      // this.router.navigate([`${movie.id}/edit`], { relativeTo: this.route })
      this.dialogRef.close();
    }
    catch (err) {
      this.snackBar.open('An error occured', 'close', { duration: 1000 });
      throw new Error(err);
    }
  }

  public cancel() {
    this.dialogRef.close();
  }

}
