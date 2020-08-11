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

  public displayedColumns = ['First Name', 'Last Name', 'Status', 'Category', 'Description',
    'Film Title', 'Filmography']

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  get international() {
    return this.form.get('title').get('international');
  }

  get original() {
    return this.form.get('title').get('original');
  }
  
  get contentTypeCtrl() {
    return this.form.get('contentType')
  }

  get banner() {
    return this.form.get('banner').get('media');
  }

  get poster() {
    return this.form.get('poster').get('media');
  }

  get directors() {
    return this.form.get('directors');
  }
}
