
// Angular
import { Intercom } from 'ng-intercom';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subscription, map, startWith } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, ChangeDetectionStrategy, ViewChild, Optional, OnInit, OnDestroy } from '@angular/core';

// Blockframes
import { FormList } from '@blockframes/utils/form';
import { MovieService } from '@blockframes/movie/service';
import { WaterfallRightholder, createWaterfallRightholder, hasDefaultVersion } from '@blockframes/model';

import { WaterfallService } from '../../waterfall.service';
import { WaterfallDocumentForm } from '../../form/document.form';
import { DashboardWaterfallShellComponent } from '../shell/shell.component';
import { WaterfallFormGuardedComponent } from '../../guards/waterfall-form-guard';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '../../form/right-holder.form';

@Component({
  selector: 'waterfall-title-edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
})
export class WaterfallEditFormComponent implements WaterfallFormGuardedComponent, OnInit, OnDestroy {

  @ViewChild('stepper') stepper?: MatStepper;

  public documentForm = new WaterfallDocumentForm({ id: '' });
  public rightholdersForm = FormList.factory<WaterfallRightholderFormValue, WaterfallRightholderForm>([], rightholder => new WaterfallRightholderForm(rightholder));
  public updating$ = new BehaviorSubject(false);
  public movieId: string = this.route.snapshot.params.movieId;
  public movie$ = this.movieService.valueChanges(this.movieId);
  public invalidDocument$ = this.shell.contracts$.pipe(
    map(docs => docs.length === 0),
    startWith(true),
  );
  public noProducer$ = this.rightholdersForm.valueChanges.pipe(
    startWith(this.rightholdersForm.value),
    map(rightholders => rightholders.length !== 0 && rightholders.filter(rightholder => rightholder.roles.includes('producer')).length !== 1)
  );
  public createMode = !hasDefaultVersion(this.shell.waterfall);
  public manualCreation$ = new BehaviorSubject(false);

  private sub: Subscription;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private movieService: MovieService,
    @Optional() private intercom: Intercom,
    private waterfallService: WaterfallService,
    public shell: DashboardWaterfallShellComponent
  ) { }

  ngOnInit() {
    this.sub = this.shell.waterfall$.subscribe(waterfall => {
      this.rightholdersForm.clear({ emitEvent: false });
      waterfall.rightholders.forEach(rightholder => this.rightholdersForm.add(createWaterfallRightholder(rightholder)));
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  previous() {
    const start = this.stepper.selectedIndex === 0;
    if (start) this.router.navigate(['..'], { relativeTo: this.route });
    else this.stepper?.previous();
  }

  async next() {
    if (this.stepper.selectedIndex === 1) await this.updateRightHolders();
    const end = this.stepper.selectedIndex === this.stepper.steps.length - 1;
    if (end) this.router.navigate(['..'], { relativeTo: this.route });
    else this.stepper?.next();
  }

  async exit() {
    await this.updateRightHolders();
    this.snackBar.open('Waterfall saved', 'close', { duration: 3000 });
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private async updateRightHolders() {
    this.updating$.next(true);

    // Remove form value with no names and no roles and format the good values
    const rightholders: WaterfallRightholder[] = this.rightholdersForm.value
      .filter(rightholder => rightholder.name || rightholder.roles.length)
      .map(rightholder => createWaterfallRightholder({
        ...rightholder,
        id: rightholder.id || this.waterfallService.createId()
      }));

    // ! `id` needs to be in the update object, because of a bug in ng-fire
    await this.waterfallService.update({ id: this.movieId, rightholders });

    this.rightholdersForm.markAsPristine();

    this.updating$.next(false);
  }

  displayGraph() {
    this.manualCreation$.next(true);
  }

  openIntercom() {
    return this.intercom.show('I need help to create a waterfall');
  }

  async publishWaterfall() {
    this.updating$.next(true);
    await this.shell.refreshWaterfall();
    this.updating$.next(false);
    this.snackBar.open(`Waterfall ${this.createMode ? 'Published' : 'Updated'}`, 'close', { duration: 3000 });
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
