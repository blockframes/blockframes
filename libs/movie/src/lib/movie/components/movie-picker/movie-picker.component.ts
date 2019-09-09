import { ChangeDetectionStrategy, Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { MovieQuery } from '../../+state/movie.query';
import { Movie } from '../../+state/movie.model';

@Component({
  selector: 'movie-picker',
  templateUrl: './movie-picker.component.html',
  styleUrls: ['./movie-picker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoviePickerComponent implements OnInit {
  public movies$: Observable<Movie[]>;
  public isLoading$: Observable<boolean>;
  @Output() selected = new EventEmitter<string>();
  @Output() selectedMovieId = new EventEmitter<string>();

  constructor(private query: MovieQuery) {}

  ngOnInit() {
    this.movies$ = this.query.selectAll();
    this.isLoading$ = this.query.selectLoading();
  }

  public selectedId(movieId: string) {
    console.log(movieId);
    this.selectedMovieId.emit(movieId);
  }
}
