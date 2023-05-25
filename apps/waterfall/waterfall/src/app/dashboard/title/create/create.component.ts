// Angular
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { FormControl, Validators } from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

// Blockframes
import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { RightholderRole, createAppConfig } from '@blockframes/model';
import { OrganizationService } from '@blockframes/organization/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permission.service';


@Component({
  selector: 'waterfall-title-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateComponent implements OnInit {

  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });

  waterfallForm = new FormControl<RightholderRole[]>(undefined, [Validators.required]);

  movieId = this.movieService.createId();

  invalid$: Observable<boolean>;

  constructor(
    private movieService: MovieService,
    private orgService: OrganizationService,
    private uploadService: FileUploaderService,
    private waterfallService: WaterfallService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  ngOnInit() {
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
      startWith(true),
    );
  }

  // create a new movie along with its waterfall & waterfall permissions
  async create() {
    const waterfall = createAppConfig({ access: true, status: 'accepted' });
    await this.movieService.create({
      ...this.movieForm.value,
      id: this.movieId,
      app: { waterfall },
    });

    this.uploadService.upload();

    const orgId = this.orgService.org.id;
    this.waterfallService.create(this.movieId, [ orgId ]);
    this.permissionsService.create(this.movieId, { id: orgId, roles: this.waterfallForm.value });
  }
}
