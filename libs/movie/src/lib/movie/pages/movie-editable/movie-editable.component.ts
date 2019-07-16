import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MovieQuery } from '../../+state';
import { FlatMovie } from '../../components/movie-form/movie.form';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'movie-editable',
  templateUrl: './movie-editable.component.html',
  styleUrls: ['./movie-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEditableComponent implements OnInit {
  public fullScreen = false;
  public form$: Observable<FlatMovie>;

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
