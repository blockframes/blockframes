import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { createMovie, MovieQuery, MovieService } from '../../+state';
import { MatSnackBar } from '@angular/material';
import { PersistNgFormPlugin } from '@datorama/akita';
import { Router } from '@angular/router';
import { MovieForm } from './movie.form';

@Component({
  selector: 'movie-form',
  templateUrl: './movie-form.component.html',
  styleUrls: ['./movie-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MovieFormComponent implements OnInit, OnDestroy {
  public persistForm: PersistNgFormPlugin;
  navLinks: any[];
  activeLinkIndex = -1;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private snackBar: MatSnackBar,
    private router: Router,
    public form: MovieForm,
  ) {

    this.navLinks = [
      {
        label: 'Main Informations',
        link: './main',
        index: 0
      }, {
        label: 'Story description',
        link: './story',
        index: 1
      }, {
        label: 'Movie Team',
        link: './team',
        index: 2
      }, {
        label: 'Promotional elements',
        link: './promo',
        index: 3
      },
    ];
  }

  ngOnInit() {

    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });

    // Akita Persist Form
    this.persistForm = new PersistNgFormPlugin(this.query, createMovie).setForm(this.form);

    this.form.populate(this.query.getActive());
  }

  /* Saves the form */
  public submit() {
    console.log(this.form.valid)
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 2000 });
      throw new Error('Invalid form');
    } else {
      this.snackBar.open(`${this.form.get('originalTitle').value} saved.`, 'close', { duration: 2000 });
      this.service.update(this.query.getActiveId(), this.preUpdate({ ...this.form.value }));
    }
  }

  /* Applies movie modifications to fit actual model */
  private preUpdate(movie: any) {
    movie.title = {};
    if (movie.originalTitle) {
      movie.title.original = movie.originalTitle;
    }

    if (movie.internationalTitle) {
      movie.title.international = movie.internationalTitle;
    }
    delete movie.originalTitle;
    delete movie.internationalTitle;

    return movie;
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
