import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  EventEmitter,
  Output
} from '@angular/core';
import { Movie } from '../../+state';
import { RouterQuery } from '@datorama/akita-ng-router-store';

@Component({
  selector: 'movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieListComponent {
  @HostBinding('attr.page-id') pageId = 'movie-list';
  @Input() movies: Movie[];
  @Output() deleteMovie = new EventEmitter<Movie>();

  constructor(private routerQuery: RouterQuery) {}

  public navigateToApp(movieId: string) {
    const appName = this.routerQuery.getValue().state.root.data.app;
    return `/layout/o/${appName}/${movieId}/list`;
  }

  public delete(movie: Movie) {
    this.deleteMovie.emit(movie);
  }
}
