
// Angular
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, map, startWith, tap } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';

// Blockframes
import { FormList } from '@blockframes/utils/form';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallRightholder, createWaterfallRightholder } from '@blockframes/model';

import { WaterfallService } from '../../waterfall.service';
import { WaterfallDocumentForm } from '../../form/document.form';
import { WaterfallDocumentsService } from '../../documents.service';
import { WaterfallPermissionsService } from '../../permissions.service';
import { WaterfallFormGuardedComponent } from '../../guards/waterfall-form-guard';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '../../form/right-holder.form';


@Component({
  selector: 'waterfall-title-edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
})
export class WaterfallEditFormComponent implements WaterfallFormGuardedComponent {

  documentForm = new WaterfallDocumentForm({ id: '' });
  rightholdersForm = FormList.factory<WaterfallRightholderFormValue, WaterfallRightholderForm>([], rightholder => new WaterfallRightholderForm(rightholder));

  @ViewChild('stepper') stepper?: MatStepper;

  updating$ = new BehaviorSubject(false);

  movieId: string = this.route.snapshot.params.movieId;
  movie$ = this.movieService.valueChanges(this.movieId);

  invalidDocument$ = this.documentService.valueChanges({ waterfallId: this.movieId }).pipe(
    map(docs => docs.length === 0),
    startWith(true),
  );

  invalidRightholders$ = this.waterfallService.valueChanges(this.movieId).pipe(
    tap(waterfall => {
      this.rightholdersForm.clear({ emitEvent: false });
      waterfall.rightholders.forEach(rightholder => this.rightholdersForm.add(createWaterfallRightholder(rightholder)));
    }),
    map(waterfall => waterfall.rightholders.every(rightholder => !rightholder.roles.includes('producer'))),
    startWith(true),
  );

  createMode = this.route.snapshot.data.createMode ?? true;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private movieService: MovieService,
    private waterfallService: WaterfallService,
    private documentService: WaterfallDocumentsService,
    private permissionService: WaterfallPermissionsService,
  ) { }

  previous() {
    const start = this.stepper.selectedIndex === 0;
    if (start) this.router.navigate(['..'], { relativeTo: this.route });
    else this.stepper?.previous();
  }

  next() {
    const end = this.stepper.selectedIndex === this.stepper.steps.length - 1;
    if (end) this.router.navigate(['..'], { relativeTo: this.route });
    else this.stepper?.next();
  }

  back() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  async updateRightHolders() {
    if (this.rightholdersForm.pristine) {
      this.next();
      return;
    }

    this.updating$.next(true);

    // Remove form value with no names and no roles and format the good values
    const rightholders: WaterfallRightholder[] = this.rightholdersForm.value
      .filter(rightholder => rightholder.name || rightholder.roles.length)
      .map(rightholder => createWaterfallRightholder({
        ...rightholder,
        id: rightholder.id || this.waterfallService.createId()
      }))
    ;

    // ! `id` needs to be in the update object, because of a bug in ng-fire
    await this.waterfallService.update({ id: this.movieId, rightholders });

    this.rightholdersForm.markAsPristine();

    this.updating$.next(false);
    this.snackBar.open('Right Holders updated!', 'close', { duration: 3000 });
  }
}
