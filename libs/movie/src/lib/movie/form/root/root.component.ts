import { ChangeDetectionStrategy, Component, ViewEncapsulation, Input } from '@angular/core';
import { MovieQuery, MovieService, createMovieRating, createMovieOriginalRelease } from '../../+state';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MovieForm } from './../movie.form';
import { MatDialog } from '@angular/material/dialog';
import { MovieImdbSearchComponent } from '../../components/movie-imdb-search/movie-imdb-search.component';
import { SearchRequest, ImdbMovie, ImageUploader } from '@blockframes/utils';
import { formatCredit, formatCredits } from '@blockframes/utils/spreadsheet/format';
import { getCodeIfExists, ExtractCode } from '@blockframes/utils/static-model/staticModels';
import { Router } from '@angular/router';

@Component({
  selector: '[form] movie-form-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MovieFormRootComponent {
  @Input() public form: MovieForm;

  constructor(
    private query: MovieQuery,
    private service: MovieService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private imageUploader: ImageUploader,
    private router: Router
  ) { }

  /* Saves the form */
  public submit() {
    if (!this.form.valid) {
      this.snackBar.open('form invalid', 'close', { duration: 2000 });
      throw new Error('Invalid form');
    } else {
      this.snackBar.open(`${this.form.main.title.get('original').value} saved.`, 'close', { duration: 2000 });
      this.service.updateById(this.query.getActiveId(), { ...this.form.value });
    }
  }

  public cancel() {
    this.router.navigateByUrl('');
  }

  /**
   * Allow to fill movie form with IMDB data
   */
  public fillForm() {
    const data = {
      name: this.form.main.title.get('original').value,
      year: this.form.main.get('productionYear').value
    } as SearchRequest;

    const dialogRef = this.dialog.open(MovieImdbSearchComponent, { data, width: '700px' });

    dialogRef.afterClosed().subscribe(async (movie: ImdbMovie) => {
      if (movie !== undefined && movie !== null) {

        // TITLE
        this.form.main.title.get('original').setValue(movie.title);

        // PRODUCTION YEAR
        this.form.main.get('productionYear').setValue(movie.year);

        // DIRECTOR
        this.form.main.directors.clear();
        this.form.main.addDirector(formatCredit(movie.director));

        // ACTORS
        this.form.get('salesCast').cast.clear();
        formatCredits(movie.actors).map(credit => this.form.get('salesCast').addCredit({ ...credit, role: 'actor' }, 'cast'));

        // WRITERS
        this.form.get('salesCast').crew.clear();
        formatCredits(movie.writer).map(credit => this.form.get('salesCast').addCredit({ ...credit, role: 'writer' }, 'crew'));

        // SHORT SYNOPSIS
        this.form.main.get('shortSynopsis').setValue(movie.plot.substring(0, 500));

        // SYNOPSIS
        this.form.get('story').get('synopsis').setValue(movie.plot.substring(0, 500));

        // LANGUAGES
        const languages = [];
        movie.languages.split(',').forEach((g: string) => {
          const language = getCodeIfExists('LANGUAGES', g.trim() as ExtractCode<'LANGUAGES'>);
          if (language) { languages.push(language) }
        });
        this.form.main.get('originalLanguages').setValue(languages);

        // ORIGIN COUNTRY
        const countries = [];
        movie.country.split(',').forEach((c: string) => {
          c = c.trim();
          if (c === 'USA') { c = 'United States' };
          const country = getCodeIfExists('TERRITORIES', c as ExtractCode<'TERRITORIES'>);
          if (country) { countries.push(country) }
          this.form.main.get('originCountries').setValue(countries);
        });

        // ORIGINAL RELEASE 
        // We put the same date for various origin countries
        const releases = countries.map(country => createMovieOriginalRelease({country, date: movie.released}));
        this.form.get('salesInfo').get('originalRelease').setValue(releases);

        // GENRES
        const genres = [];
        movie.genres.split(',').forEach((g: string) => {
          g = g.trim();
          if (g === 'Sci-Fi') { g = 'Science Fiction' };
          const genre = getCodeIfExists('GENRES', g as ExtractCode<'GENRES'>);
          if (genre) { genres.push(genre) }
        });
        this.form.main.get('genres').setValue(genres);

        // TOTAL RUN TIME
        this.form.main.get('totalRunTime').setValue(parseInt(movie.runtime.replace(' min', ''), 10));

        // PEGI (Rating)
        this.form.get('salesInfo').get('rating').setValue([createMovieRating({value: movie.rated})]);

        // STATUS
        this.form.main.get('status').setValue('finished');

        this.snackBar.open('Form filled with IMDB data!', 'close', { duration: 2000 });
      }
    });
  }
}
