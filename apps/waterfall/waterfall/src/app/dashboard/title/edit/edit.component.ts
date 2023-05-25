// Angular
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { RightholderRole } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { OrganizationService } from '@blockframes/organization/service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';


@Component({
  selector: 'waterfall-title-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent implements OnInit {

  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });
  waterfallRoleControl = new FormControl<RightholderRole[]>(undefined, [Validators.required]);

  movieId = '';

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
    startWith(false),
  );

  loading$ = new BehaviorSubject(true);
  updating$ = new BehaviorSubject(false);

  constructor(
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private uploadService: FileUploaderService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.params.movieId;
    
    const [ movie, permissions ] = await Promise.all([
      this.movieService.getValue(this.movieId),
      this.permissionsService.getValue(this.orgService.org.id, { waterfallId: this.movieId }),
    ]);

    this.movieForm.patchValue(movie);
    this.waterfallRoleControl.patchValue(permissions.roles);

    this.loading$.next(false);    
  }

  // update a new movie along with its waterfall permissions
  async update() {
    this.updating$.next(true);
    await this.movieService.update({
      ...this.movieForm.value,
      id: this.movieId,
    });

    this.uploadService.upload();

    const orgId = this.orgService.org.id;
    await this.permissionsService.update(orgId, { roles: this.waterfallRoleControl.value }, { params: { waterfallId: this.movieId }  });

    this.updating$.next(false);
    this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
  }
}
