import { ChangeDetectionStrategy, Component, OnInit, HostBinding, Input } from '@angular/core';
import { MovieService, MovieQuery, Movie } from '../../+state';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieListComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'movie-list';
  @Input() movies: Movie[];
  public loading$: Observable<boolean>;

  constructor(
    private service: MovieService,
    private query: MovieQuery,
    private routerQuery: RouterQuery,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loading$ = this.query.selectLoading();
  }

  public remove(movie: Movie) {
    try {
      this.service.remove(movie.id);
      this.snackBar.open(`Movie "${movie.main.title.original}" has been deleted.`, 'close', {duration: 2000});
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 2000 });
    }
  }

  public get appName() {
    return this.routerQuery.getValue().state.root.data.app;
  }
}
