import { ChangeDetectionStrategy, Component, OnInit, HostBinding } from '@angular/core';
import { MovieQuery, Movie } from '../../+state';
import { Observable } from 'rxjs/internal/Observable';
import { MovieForm } from '../../form/movie.form';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'movie-editable',
  templateUrl: './movie-editable.component.html',
  styleUrls: ['./movie-editable.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieEditableComponent implements OnInit {
  @HostBinding('attr.page-id') pageId = 'movie-editable';
  public fullScreen = false;
  public form$: Observable<Movie>;
  public form: MovieForm;

  constructor(
    private query: MovieQuery,
  ) { }

  ngOnInit() {
    // TODO: issue#1084, use PersistNgFormPlugin of Akita to save changes of form in the state
    const movie = this.query.getActive();
    this.form = new MovieForm();
    this.form.patchValue(movie);
    this.form$ = this.form.valueChanges.pipe(startWith(movie));
  }

  public toggleFullScreen() {
    return this.fullScreen = !this.fullScreen;
  }
}
