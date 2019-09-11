import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { createMovie, MovieQuery, MovieService, Credit } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersistNgFormPlugin } from '@datorama/akita';
import { Router } from '@angular/router';
import { MovieForm } from './../movie.form';
import { MatDialog } from '@angular/material';
import { MovieImdbSearchComponent } from '../../components/movie-imdb-search/movie-imdb-search.component';
import { SearchRequest, ImdbMovie, FormEntity, formatCredit, formatCredits } from '@blockframes/utils';
import { FormControl } from '@angular/forms';
import { HttpUpload } from '@blockframes/ui';
import { getCodeIfExists } from '../../staticModels';

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
    private dialog: MatDialog,
    private httpUpload: HttpUpload,
  ) { }


  ngOnInit() {
    // @todo #643 => navigation arrows , not mat-tab
    // @see https://projects.invisionapp.com/d/main#/console/17971669/374982976/preview

    this.form = new MovieForm(this.query.getActive());

    // Akita Persist Form
    this.persistForm = new PersistNgFormPlugin(this.query, createMovie).setForm(this.form);

  }

  /* Saves the form */
  public submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 2000 });
      throw new Error('Invalid form');
    } else {
      this.snackBar.open(`${this.form.get('main').get('title').get('original').value} saved.`, 'close', { duration: 2000 });
      this.service.updateById(this.query.getActiveId(), { ...this.form.value });
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

  /**
   * Allow to fill movie form with IMDB data
   */
  public fillForm() {
    const data = {
      name: this.form.get('main').get('title').get('original').value,
      year: this.form.get('main').get('productionYear').value
    } as SearchRequest;

    const dialogRef = this.dialog.open(MovieImdbSearchComponent, { data, width: '700px' });

    dialogRef.afterClosed().subscribe(async (movie: ImdbMovie) => {
      if (movie !== undefined) {

        // TITLE
        this.form.get('main').get('title').get('original').setValue(movie.title);

        // PRODUCTION YEAR
        this.form.get('main').get('productionYear').setValue(movie.year);

        // POSTER
        const poster = await this.httpUpload.uploadImageToFirestore(movie.poster);
        if (poster) {
          this.form.get('main').get('poster').setValue(poster);
        }

        // DIRECTOR
        this.form.get('main').directors.clear();
        this.form.get('main').addDirector(formatCredit(movie.director));

        // ACTORS
        this.form.get('salesCast').credits.clear();
        formatCredits(movie.actors).map(credit => this.form.get('salesCast').addCredit({ ...credit, creditRole: 'actor' }));

        // WRITERS
        formatCredits(movie.writer).map(credit => this.form.get('salesCast').addCredit({ ...credit, creditRole: 'writer' }));

        // PRODUCTION COMPANY
        this.form.get('main').productionCompanies.clear();
        movie.production.split(',').forEach((a: string) => {
          this.form.get('main').productionCompanies.push(new FormEntity<Credit>({
            firstName: new FormControl(a.trim()),
          }));
        })

        // SHORT SYNOPSIS
        this.form.get('main').get('shortSynopsis').setValue(movie.plot.substring(0, 500));

        // SYNOPSIS
        this.form.get('story').get('synopsis').setValue(movie.plot.substring(0, 500));

        // LANGUAGES
        const languages = [];
        movie.languages.split(',').forEach((g: string) => {
          const language = getCodeIfExists('LANGUAGES', g.trim());
          if (language) { languages.push(language) }
        });
        this.form.get('main').get('languages').setValue(languages);

        // ORIGIN COUNTRY RELEASE DATE (Release date in Origin Country)
        this.form.get('salesInfo').get('originCountryReleaseDate').setValue(movie.released);

        // ORIGIN COUNTRY
        const countries = [];
        movie.country.split(',').forEach((c: string) => {
          c = c.trim();
          if (c === 'USA') { c = 'United States' };
          const country = getCodeIfExists('TERRITORIES', c);
          if (country) { countries.push(country) }
          this.form.get('main').get('originCountries').setValue(countries);
        });

        // GENRES
        const genres = [];
        movie.genres.split(',').forEach((g: string) => {
          g = g.trim();
          if (g === 'Sci-Fi') { g = 'Science Fiction' };
          const genre = getCodeIfExists('GENRES', g);
          if (genre) { genres.push(genre) }
        });
        this.form.get('main').get('genres').setValue(genres);

        // LENGTH
        this.form.get('main').get('length').setValue(parseInt(movie.runtime.replace(' min', ''), 10));

        // PEGI (Rating)
        this.form.get('salesInfo').get('pegi').setValue(movie.rated);

        // STATUS
        this.form.get('main').get('status').setValue('finished');

        this.snackBar.open('Form filled with IMDB data!', 'close', { duration: 2000 });
      }
    });
  }
}
