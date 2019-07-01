import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MovieService, MovieQuery } from '../../+state';
import { Router } from '@angular/router';

@Component({
  selector: 'movie-title-form',
  templateUrl: './movie-title-form.component.html',
  styleUrls: ['./movie-title-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieTitleFormComponent implements OnInit {
  public titleForm: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<MovieTitleFormComponent>,
    private snackBar: MatSnackBar,
    private builder: FormBuilder,
    private service: MovieService,
    private router: Router,
    private movieQuery: MovieQuery,
  ) { }

  ngOnInit() {
    this.titleForm = this.builder.group({
      title: ['', Validators.required]
    });
  }

  public async newMovie() {
    if (!this.titleForm.valid) {
      this.snackBar.open('Invalid form', 'close', { duration: 1000 });
      return
    }

    try {
      const { title } = this.titleForm.value;
      this.snackBar.open('Movie created! Redirecting..', 'close', { duration: 3000 });
      const movie = await this.service.add(title, true);

      this.movieQuery.selectEntity(movie.id)
      this.router.navigate([`/layout/o/home/${movie.id}/edit`]);
      this.dialogRef.close();
    }
    catch (err) {
      this.snackBar.open('An error occured', 'close', { duration: 1000 });
      throw new Error('An error occured');
    }
  }

  public cancel() {
    this.dialogRef.close();
  }

}
