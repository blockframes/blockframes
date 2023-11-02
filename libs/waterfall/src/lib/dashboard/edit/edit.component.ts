
// Angular
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { BehaviorSubject, combineLatest, map, startWith } from 'rxjs';
import { Component, ChangeDetectionStrategy, OnInit, ViewChild } from '@angular/core';

// Blockframes
import { FormList } from '@blockframes/utils/form';
import { MovieService } from '@blockframes/movie/service';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { OrganizationService } from '@blockframes/organization/service';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { WaterfallFormGuardedComponent } from '@blockframes/waterfall/guard';
import { FileUploaderService } from '@blockframes/media/file-uploader.service';
import { WaterfallPermissionsService } from '@blockframes/waterfall/permissions.service';
import { RightholderRole, WaterfallRightholder, createAppConfig, createMovieAppConfig, createWaterfallRightholder } from '@blockframes/model';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '@blockframes/waterfall/form/right-holder.form';
import { WaterfallDocumentForm } from '@blockframes/waterfall/form/document.form';

@Component({
  selector: 'waterfall-title-edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
})
export class WaterfallEditFormComponent implements OnInit, WaterfallFormGuardedComponent {

  createMode = true;

  documentForm = new WaterfallDocumentForm({ id: '' });
  movieForm = new MovieForm({ directors: [{ firstName: '', lastName: '' }] });
  waterfallRoleControl = new FormControl<RightholderRole[]>(undefined, [Validators.required]);
  rightholdersForm = FormList.factory<WaterfallRightholderFormValue, WaterfallRightholderForm>([], rightholder => new WaterfallRightholderForm(rightholder));

  movieId = '';

  @ViewChild('stepper') stepper?: MatStepper;

  // check the invalidity of the movie forms value to disable/enable the create button
  invalidMovie$ = combineLatest([
    this.movieForm.valueChanges,
    this.waterfallRoleControl.valueChanges,
  ]).pipe(
    map(([movie, waterfall]) => {
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
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private orgService: OrganizationService,
    private uploadService: FileUploaderService,
    private waterfallService: WaterfallService,
    private permissionsService: WaterfallPermissionsService,
  ) { }

  async ngOnInit() {
    this.createMode = this.route.snapshot.data.createMode ?? true;

    this.movieId = this.createMode ?
      this.movieService.createId() :
      this.route.snapshot.params.movieId;

    if (!this.createMode) {
      const [movie, waterfall, permissions] = await Promise.all([
        this.movieService.getValue(this.movieId),
        this.waterfallService.getValue(this.movieId),
        this.permissionsService.getValue(this.orgService.org.id, { waterfallId: this.movieId }),
      ]);

      this.movieForm.patchValue(movie);
      this.waterfallRoleControl.patchValue(permissions.roles);
      this.rightholdersForm.clear({ emitEvent: false });
      if (waterfall.rightholders.length === 0) this.rightholdersForm.add(createWaterfallRightholder());
      waterfall.rightholders.forEach(rightholder => this.rightholdersForm.add(rightholder));
    }
    this.loading$.next(false);
  }

  skip() {
    const end = this.stepper.selectedIndex === this.stepper.steps.length - 1;
    if (end) this.router.navigate(['..'], { relativeTo: this.route });
    else this.stepper?.next();
  }

  // update a new movie along with its waterfall permissions
  async update() {
    if (!this.movieForm.pristine || !this.waterfallRoleControl.pristine) {
      this.updating$.next(true);

      const orgId = this.orgService.org.id;
      if (this.createMode) {
        const appAccess = createMovieAppConfig({ waterfall: createAppConfig({ status: 'accepted', access: true }) });
        const movie = await this.movieService.create({ ...this.movieForm.value, id: this.movieId, app: appAccess });
        this.uploadService.upload();

        await this.waterfallService.create(this.movieId, movie.orgIds);
        await this.permissionsService.create(this.movieId, { id: orgId, roles: this.waterfallRoleControl.value });

      } else {
        await this.movieService.update({ ...this.movieForm.value, id: this.movieId });
        this.uploadService.upload();

        if (this.waterfallRoleControl.value.includes('producer')) { // Only producer can update waterfall permissions
          await this.permissionsService.update(orgId, { roles: this.waterfallRoleControl.value }, { params: { waterfallId: this.movieId } });
        }
      }

      this.movieForm.markAsPristine();
      this.waterfallRoleControl.markAsPristine();

      this.updating$.next(false);
      this.snackBar.open('Movie updated!', 'close', { duration: 3000 });
    }

    if (!this.rightholdersForm.pristine) {
      this.updating$.next(true);

      // Remove form value with no names and no roles and format the good values
      const rightholders: WaterfallRightholder[] = this.rightholdersForm.value.filter(rightholder => rightholder.name || rightholder.roles.length)
        .map(rightholder => createWaterfallRightholder({
          ...rightholder,
          id: rightholder.id || this.waterfallService.createId()
        }));

      // ! `id` needs to be in the update object, because of a bug in ng-fire
      console.log(rightholders);
      await this.waterfallService.update({ id: this.movieId, rightholders });
      this.rightholdersForm.markAsPristine();

      this.updating$.next(false);
      this.snackBar.open('Right Holders updated!', 'close', { duration: 3000 });
    }
    this.stepper?.next();
  }
}
