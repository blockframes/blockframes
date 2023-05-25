// Angular
import { ActivatedRoute } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, startWith } from 'rxjs';

// Blockframes
import { RightholderRole } from '@blockframes/model';
import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { OrganizationService } from '@blockframes/organization/service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permission.service';


@Component({
  selector: 'waterfall-title-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditComponent implements OnInit {

  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });

  waterfallForm = new FormControl<RightholderRole[]>(undefined, [Validators.required]);

  movieId = '';

  invalid$: Observable<boolean>;

  loading$ = new BehaviorSubject(true);

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private uploadService: FileUploaderService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.params.movieId;
    const [ movie ] = await this.movieService.getValue([this.movieId]);
    this.movieForm.patchValue(movie);

    const permissions = await this.permissionsService.getValue(this.orgService.org.id, { waterfallId: this.movieId });
    this.waterfallForm.patchValue(permissions.roles as any);

    this.loading$.next(false);

    // check the invalidity of the forms value to disable/enable the create button
    this.invalid$ = combineLatest([
      this.movieForm.valueChanges,
      this.waterfallForm.valueChanges,
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
  }

  // update a new movie along with its waterfall & waterfall permissions
  async update() {
    await this.movieService.update({
      ...this.movieForm.value,
      id: this.movieId,
    });

    this.uploadService.upload();

    const orgId = this.orgService.org.id;
    this.permissionsService.update(this.movieId, { id: orgId, roles: this.waterfallForm.value });
  }
}
