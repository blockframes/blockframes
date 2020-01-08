import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Movie } from '@blockframes/movie/+state/movie.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MovieService } from '@blockframes/movie/+state/movie.service';
import { MovieQuery } from '@blockframes/movie/+state/movie.query';
import { MovieTitleFormComponent } from '@blockframes/movie/components/movie-title-form/movie-title-form.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'catalog-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public movies$: Observable<Movie[]>;
  public loading$: Observable<boolean>;

  constructor(
    private movieQuery: MovieQuery,
    private dialog: MatDialog,
    private movieService: MovieService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.movies$ = this.movieQuery.selectAll();
    this.loading$ = this.movieQuery.selectLoading();
  }

  public addNewMovie() {
    this.dialog.open(MovieTitleFormComponent);
  }

  public remove(movie: Movie) {
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
