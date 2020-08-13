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

  public displayedColumns = {
    firstName: 'First Name', lastName: 'Last Name', status: 'Status', category: 'Category', description: 'Description',
    filmTitle: 'Film Title', filmography: 'Filmography'
  }

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

  get internalRef() {
    return this.form.get('internalRef')
  }

  get banner() {
    return this.form.get('banner').get('media');
  }

  get poster() {
    return this.form.get('poster').get('media');
  }

  get runningTime() {
    return this.form.get('runningTime').get('time');
  }

  get directors() {
    return this.form.get('directors');
  }
}
