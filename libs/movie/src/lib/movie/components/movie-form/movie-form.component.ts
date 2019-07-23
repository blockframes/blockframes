import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { createMovie, MovieQuery, MovieService } from '../../+state';
import { MatSnackBar } from '@angular/material';
import { PersistNgFormPlugin } from '@datorama/akita';
import { Router, ActivatedRoute, Params } from '@angular/router';
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
  public sectionId: string;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private snackBar: MatSnackBar,
    private router: Router,
    public form: MovieForm,
    private route: ActivatedRoute,
  ) {
    

    this.navLinks = [
      {
        label: 'Main Informations',
        link: '../../edit-new/main',
        index: 0
      }, {
        label: 'Story description',
        link: '../../edit-new/story',
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
    this.route.params.subscribe((params: Params) => {
      this.sectionId = params.sectionId;
    })

    this.router.events.subscribe(() => {
      this.activeLinkIndex = this.navLinks.indexOf(this.navLinks.find(tab => tab.link === '.' + this.router.url));
    });

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
      this.service.update(this.query.getActiveId(), this.preUpdate({ ...this.form.value }));
    }
  }

  /* Applies movie modifications to fit actual model */
  //@todo #643 should be removed
  private preUpdate(movie: any) {

    return JSON.parse(JSON.stringify(movie)); //@todo remove #483
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
