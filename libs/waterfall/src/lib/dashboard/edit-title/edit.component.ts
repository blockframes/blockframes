
import { BehaviorSubject, map, startWith } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { OrganizationService } from '@blockframes/organization/service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { MovieCurrency, createAppConfig, createMovieAppConfig, createWaterfallRightholder } from '@blockframes/model';

import { WaterfallService } from '../../waterfall.service';

@Component({
  selector: 'waterfall-title-edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallEditTitleComponent implements OnInit {

  createMode = true;
  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });
  currencyControl = new FormControl<MovieCurrency>('USD');
  movieId = '';

  // check the invalidity of the movie forms value to disable/enable the create button
  invalidMovie$ = this.movieForm.valueChanges.pipe(
    map(movie => {
      // check movie
      if (!movie.title.international) return true;
      if (movie.directors.length === 0) return true;
      const missing = movie.directors.some(d => !d.firstName || !d.lastName);
      if (missing) return true;
      return false;
    }),
    startWith(false),
  );

  loading$ = new BehaviorSubject(true);
  updating$ = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private uploadService: FileUploaderService,
    private waterfallService: WaterfallService,
  ) { }

  async ngOnInit() {
    this.createMode = this.route.snapshot.data.createMode ?? true;

    this.movieId = this.createMode ?
      this.movieService.createId() :
      this.route.snapshot.params.movieId;

    if (!this.createMode) {
      const [movie, waterfall] = await Promise.all([
        this.movieService.getValue(this.movieId),
        this.waterfallService.getValue(this.movieId)
      ]);
      this.movieForm.patchValue(movie);
      this.currencyControl.setValue(waterfall.mainCurrency);
    }
    this.loading$.next(false);
  }

  async update() {
    if (!this.movieForm.pristine || !this.currencyControl.pristine) {
      this.updating$.next(true);
      const orgId = this.orgService.org.id;

      if (this.createMode) {
        const appAccess = createMovieAppConfig({ waterfall: createAppConfig({ status: 'accepted', access: true }) });
        await this.movieService.create({ ...this.movieForm.value, id: this.movieId, app: appAccess });
        this.uploadService.upload();
        const defaultRightholder = createWaterfallRightholder({
          id: this.orgService.org.id,
          name: this.orgService.org.name,
          roles: ['producer'],
        });
        await this.waterfallService.create(this.movieId, [orgId], [defaultRightholder]);
        this.router.navigate(['../', this.movieId], { relativeTo: this.route });

      } else {
        await this.movieService.update({ ...this.movieForm.value, id: this.movieId });
        await this.waterfallService.update({ id: this.movieId, mainCurrency: this.currencyControl.value });
        this.uploadService.upload();
        this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
        this.router.navigate(['..'], { relativeTo: this.route });
      }
    } else {
      if (this.createMode) this.router.navigate(['../', this.movieId], { relativeTo: this.route });
      else this.router.navigate(['..'], { relativeTo: this.route });
    }
  }
}
