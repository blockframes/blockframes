import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MovieFormShellComponent } from '../shell/shell.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent {
  form = this.shell.form;
  public movieId = this.route.snapshot.params.movieId;

  public displayedColumns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    status: 'Status',
    category: 'Category',
    description: 'Description',
    filmTitle: 'Film Title',
    filmography: 'Filmography'
  }

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  get title() {
    return this.form.get('title');
  }

  get international() {
    return this.title.get('international');
  }

  get original() {
    return this.title.get('original');
  }

  get contentType() {
    return this.form.get('contentType');
  }

  get internalRef() {
    return this.form.get('internalRef')
  }

  get banner() {
    return this.form.get('banner');
  }

  get poster() {
    return this.form.get('poster');
  }

  get runningTime() {
    return this.form.get('runningTime').get('time');
  }

  get directors() {
    return this.form.get('directors');
  }
}
