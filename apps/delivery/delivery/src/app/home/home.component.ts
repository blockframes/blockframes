import { ChangeDetectionStrategy, OnInit, Component, HostBinding } from '@angular/core';
import { MovieQuery } from '@blockframes/movie/movie/+state/movie.query';
import { Movie } from '@blockframes/movie/movie/+state/movie.model';
import { MovieTitleFormComponent } from '@blockframes/movie/movie/components/movie-title-form/movie-title-form.component';
import { Observable } from 'rxjs';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MovieService } from '@blockframes/movie';

@Component({
  selector: 'delivery-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryHomeComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'movie-list'
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
    // TODO: Handle errors from firestore security rules => ISSUE#1495
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }
}
