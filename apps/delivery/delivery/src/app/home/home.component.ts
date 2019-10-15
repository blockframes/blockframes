import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery, Movie, MovieService } from '@blockframes/movie';
import { MovieTitleFormComponent } from '@blockframes/movie/movie/components/movie-title-form/movie-title-form.component';
import { MatDialog, MatSnackBar } from '@angular/material';

@Component({
  selector: 'delivery-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public loading$: Observable<boolean>;
  public movies$: Observable<Movie[]>;

  constructor(
    private movieQuery: MovieQuery,
    private movieService: MovieService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loading$ = this.movieQuery.selectLoading();
    this.movies$ = this.movieQuery.selectAll();
  }

  public addMovie() {
    this.dialog.open(MovieTitleFormComponent);
  }

  public deleteMovie(movie: Movie) {
    try {
      this.movieService.remove(movie.id);
      this.snackBar.open(`Movie "${movie.main.title.original}" has been deleted.`, 'close', {
        duration: 2000
      });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
