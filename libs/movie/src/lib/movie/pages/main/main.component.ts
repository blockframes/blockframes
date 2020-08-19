// Angular
import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Component
import { MovieFormShellComponent } from '../shell/shell.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'movie-form-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieFormMainComponent implements OnInit, OnDestroy {
  form = this.shell.form;
  public movieId = this.route.snapshot.params.movieId;
  public sub: Subscription;

  public displayedColumns = {
    firstName: 'First Name',
    lastName: 'Last Name',
    status: 'Status',
    category: 'Category',
    description: 'Description',
    filmography: 'Filmography'
  }

  constructor(private shell: MovieFormShellComponent, private route: ActivatedRoute) { }

  ngOnInit() {
    this.sub = this.form.valueChanges.subscribe(() => {
      console.log(this.form.valid);
      if (!this.form.valid) {
        this.focusOut();
      }
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  focusOut() {
    return this.form.get('runningTime').get('time').setErrors({required: true});
  }

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
    return this.form.get('runningTime');
  }

  get directors() {
    return this.form.get('directors');
  }
}
