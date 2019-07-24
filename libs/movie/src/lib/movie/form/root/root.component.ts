import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { createMovie, MovieQuery, MovieService } from '../../+state';
import { MatSnackBar } from '@angular/material';
import { PersistNgFormPlugin } from '@datorama/akita';
import { Router } from '@angular/router';
import { MovieForm } from './../movie.form';

@Component({
  selector: 'movie-form-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None, //@todo #643 do not use
})
export class MovieFormRootComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin;
  public form: MovieForm;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private snackBar: MatSnackBar,
    private router: Router,
  ) { }
   

  ngOnInit() {
    // @todo #643 => navigation arrows , not mat-tab
    // @see https://projects.invisionapp.com/d/main#/console/17971669/374982976/preview

    this.form = new MovieForm();

    // Akita Persist Form
    this.persistForm = new PersistNgFormPlugin(this.query, createMovie).setForm(this.form);

    this.form.populate(this.query.getActive());
  }

  /* Saves the form */
  public submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 2000 });
      throw new Error('Invalid form');
    } else {
      this.snackBar.open(`${this.form.get('main').get('title').get('original').value} saved.`, 'close', { duration: 2000 });
      this.service.update(this.query.getActiveId(), JSON.parse(JSON.stringify({ ...this.form.value }))); //@todo remove #483;
    }
  }

  private clear() {
    this.persistForm.reset();
    this.form.reset();
  }

  public cancel() {
    this.clear();
    this.router.navigateByUrl('');
  }

  ngOnDestroy() {
    this.clear();
    this.persistForm.destroy();
  }
}
