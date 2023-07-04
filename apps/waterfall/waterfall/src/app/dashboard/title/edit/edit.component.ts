// Angular
import { ActivatedRoute } from '@angular/router';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';

// Blockframes
import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { OrganizationService } from '@blockframes/organization/service';
import { RightholderRole, WaterfallRightholder } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallFormGuardedComponent } from '@blockframes/waterfall/guard';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';


@Component({
  selector: 'waterfall-title-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
})
export class EditComponent implements OnInit, WaterfallFormGuardedComponent {

  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });
  waterfallRoleControl = new FormControl<RightholderRole[]>(undefined, [Validators.required]);

  rightholdersForm = new FormArray<FormGroup<{ id: FormControl<string>, name: FormControl<string>, roles: FormControl<RightholderRole[]> }>>([
    new FormGroup({ id: new FormControl('fake'), name: new FormControl(''), roles: new FormControl([]) }),
  ]);

  movieId = '';

  @ViewChild('stepper') stepper?: MatStepper;

  // check the invalidity of the movie forms value to disable/enable the create button
  invalidMovie$ = combineLatest([
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

  // check the invalidity of the rightholders forms value to disable/enable the next button
  invalidRightholders$ = this.rightholdersForm.valueChanges.pipe(
    map(rightholders => {
      return rightholders.every(rightholder => !rightholder.name && !rightholder.roles.length);
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
    private waterfallService: WaterfallService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  async ngOnInit() {
    this.movieId = this.route.snapshot.params.movieId;
    
    const [ movie, waterfall, permissions ] = await Promise.all([
      this.movieService.getValue(this.movieId),
      this.waterfallService.getValue(this.movieId),
      this.permissionsService.getValue(this.orgService.org.id, { waterfallId: this.movieId }),
    ]);

    this.movieForm.patchValue(movie);
    this.waterfallRoleControl.patchValue(permissions.roles);
    this.rightholdersForm.patchValue(waterfall.rightholders);

    this.loading$.next(false);    
  }

  skip() {
    this.stepper?.next();
  }

  // update a new movie along with its waterfall permissions
  async updateMovie() {
    if (!this.movieForm.pristine || !this.waterfallRoleControl.pristine) {
      this.updating$.next(true);
      await this.movieService.update({
        ...this.movieForm.value,
        id: this.movieId,
      });

      this.uploadService.upload();

      const orgId = this.orgService.org.id;
      await this.permissionsService.update(orgId, { roles: this.waterfallRoleControl.value }, { params: { waterfallId: this.movieId }  });

      this.movieForm.markAsPristine();
      this.waterfallRoleControl.markAsPristine();

      this.updating$.next(false);
      this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
    }
    this.stepper?.next();
  }

  async updateRightholders() {
    if (!this.rightholdersForm.pristine) {
      this.updating$.next(true);

      console.log(this.rightholdersForm.value);
      // Remove form value with no names and no roles and format the good values
      const rightholders: WaterfallRightholder[] = this.rightholdersForm.value.filter(rightholder => rightholder.name || rightholder.roles.length)
        .map(rightholder => ({ id: 'fake', name: rightholder.name ?? '', roles: rightholder.roles ?? [] }))
      ;
      console.log(rightholders);

      // ! `id` needs to be in the update object, because of a bug in ng-fire
      await this.waterfallService.update({ id: this.movieId, rightholders });
      this.rightholdersForm.markAsPristine();
      
      this.updating$.next(false);
      this.snackBar.open('Right Holders updated!', 'close', { duration: 3000 });
    }
    this.stepper?.next();
  }
}
