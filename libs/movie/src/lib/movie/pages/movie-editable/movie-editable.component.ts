import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MovieQuery, Movie } from '../../+state';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'movie-editable',
  templateUrl: './movie-editable.component.html',
  styleUrls: ['./movie-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEditableComponent implements OnInit {
  public fullScreen = false;
  public form$: Observable<Movie>;

  constructor(
    private query: MovieQuery,
  ) { }

  ngOnInit() {
    this.form$ = this.query.movieFormChanges$;
  }

  public toggleFullScreen() {
    return this.fullScreen = !this.fullScreen;
  }

}
