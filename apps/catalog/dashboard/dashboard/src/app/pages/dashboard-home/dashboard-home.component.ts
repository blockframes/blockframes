import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieService } from '@blockframes/movie/movie/+state/movie.service';
import { MatDialog } from '@angular/material/dialog';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { MovieTitleFormComponent } from '@blockframes/movie/movie/components/movie-title-form/movie-title-form.component';

@Component({
  selector: 'catalog-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogDashboardHomeComponent implements OnInit {

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
