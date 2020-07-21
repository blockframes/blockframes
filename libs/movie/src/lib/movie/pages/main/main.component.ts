import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';
import { contentType } from '@blockframes/movie/+state/movie.firestore';

@Component({
  selector: 'movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent {
  form = this.shell.form;
  public contentType = contentType;
  public movieId = this.route.snapshot.params.movieId;

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) {}

  get main() {
    return this.form.get('main');
  }

  get production() {
    return this.form.get('production');
  }

  get directors() {
    return this.main.get('directors');
  }
}
