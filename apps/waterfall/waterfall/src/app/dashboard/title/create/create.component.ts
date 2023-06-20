// Angular
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';

// Blockframes
import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { RightholderRole, createAppConfig } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallFormGuardedComponent } from '@blockframes/waterfall/guard';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';


@Component({
  selector: 'waterfall-title-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements WaterfallFormGuardedComponent {

  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });

  waterfallRoleControl = new FormControl<RightholderRole[]>(undefined, [Validators.required]);

  movieId = this.movieService.createId();

  // check the invalidity of the forms value to disable/enable the create button
  invalid$ = combineLatest([
    this.movieForm.valueChanges,
    this.waterfallRoleControl.valueChanges,
  ]).pipe(
    map(([ movie, waterfall ]) => {
      // check movie
      if (!movie.title.international) return true;
      if (movie.directors.length === 0) return true;
      const missing = movie.directors.some(d => !d.firstName || !d.lastName);
      if (missing) return true;

      // check waterfall
      if (waterfall.length === 0) return true;
      
      return false;
    }),
    startWith(true),
  );
  creating$ = new BehaviorSubject(false);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private uploadService: FileUploaderService,
    private waterfallService: WaterfallService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  // create a new movie along with its waterfall & waterfall permissions
  async create() {
    this.creating$.next(true);
    const waterfall = createAppConfig({ access: true, status: 'accepted' });
    const movie = await this.movieService.create({
      ...this.movieForm.value,
      id: this.movieId,
      app: { waterfall },
      productionStatus: 'released',
    });

    this.uploadService.upload();

    await this.waterfallService.create(this.movieId, movie.orgIds);
    await this.permissionsService.create(this.movieId, { id: movie.orgIds[0], roles: this.waterfallRoleControl.value });

    this.movieForm.markAsPristine();
    this.waterfallRoleControl.markAsPristine();

    this.creating$.next(false);
    this.router.navigate(['..', this.movieId], { relativeTo: this.route });
  }
}
