
// Angular
import { Intercom } from '@supy-io/ngx-intercom';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Subscription, combineLatest, map, startWith } from 'rxjs';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, ChangeDetectionStrategy, ViewChild, Optional, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// Blockframes
import { FormList } from '@blockframes/utils/form';
import { WaterfallRightholder, createWaterfallRightholder, hasDefaultVersion, isDefaultVersion } from '@blockframes/model';
import { WaterfallService } from '../../waterfall.service';
import { WaterfallContractForm } from '../../form/contract.form';
import { RevenueSimulationForm } from '../../form/revenue-simulation.form';
import { DashboardWaterfallShellComponent } from '../shell/shell.component';
import { WaterfallFormGuardedComponent } from '../../guards/waterfall-form-guard';
import { WaterfallRightholderForm, WaterfallRightholderFormValue } from '../../form/right-holder.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'waterfall-edit-form',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } }],
})
export class WaterfallEditFormComponent implements WaterfallFormGuardedComponent, OnInit, OnDestroy {

  @ViewChild('stepper') stepper?: MatStepper;
  public missingData = $localize`Missing data to publish Waterfall. Make sure to have Contracts and Receipt Shares`;
  public missingSimulationData = $localize`Missing data to start revenue simulation. Make sure to have Contracts and Receipt Shares`;
  public contractForm = new WaterfallContractForm({ id: '' });
  public rightholdersForm = FormList.factory<WaterfallRightholderFormValue, WaterfallRightholderForm>([], rightholder => new WaterfallRightholderForm(rightholder));
  public simulationForm = new RevenueSimulationForm();
  public updating$ = new BehaviorSubject(false);
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
  public canLeaveGraphForm = true;
  public stateMode$ = new BehaviorSubject<'simulation' | 'actual'>('actual');
  public triggerNewSource$ = new BehaviorSubject<boolean>(undefined);
  public triggerNewRight$ = new BehaviorSubject<boolean>(undefined);
  public triggerUnselect$ = new BehaviorSubject<boolean>(undefined);
  public isDuplicateVersion = false;

  private subs: Subscription[] = [];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    @Optional() private intercom: Intercom,
    private waterfallService: WaterfallService,
    public shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, 'Waterfall Management');
  }

  ngOnInit() {
    const sub = this.shell.waterfall$.subscribe(waterfall => {
      this.rightholdersForm.clear({ emitEvent: false });
      waterfall.rightholders.forEach(rightholder => this.rightholdersForm.add(createWaterfallRightholder(rightholder)));
    });
    this.subs.push(sub);

    const stateModeSub = this.stateMode$.asObservable().subscribe(mode => {
      if (mode === 'simulation') this.simulationForm.reset({ date: new Date(), fromScratch: true });
    });
    this.subs.push(stateModeSub);

    const versionSub = this.shell.versionId$.subscribe(_ => {
      if (this.stateMode$.value === 'simulation') {
        const incomes = this.simulationForm.get('incomes').value;
        const expenses = this.simulationForm.get('expenses').value;
        const fromScratch = this.simulationForm.get('fromScratch').value;
        this.shell.appendToSimulation({ incomes, expenses }, { fromScratch, resetData: true });
      }
    });
    this.subs.push(versionSub);

    const duplicateVersionSub = combineLatest([this.shell.waterfall$, this.shell.versionId$,]).subscribe(([waterfall, versionId,]) => {
      const version = waterfall.versions.find(v => v.id === versionId);
      const defaultVersion = isDefaultVersion(waterfall, versionId);
      this.isDuplicateVersion = version?.id && !defaultVersion && !version.standalone;
    });
    this.subs.push(duplicateVersionSub);

    const waterfallReadySub = this.shell.canInitWaterfall$.subscribe(canInit => {
      if (!canInit) this.stateMode$.next('actual');
    });
    this.subs.push(waterfallReadySub);
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub?.unsubscribe());
  }

  onStepClicked($event: MouseEvent) {
    const id = ($event.target as HTMLElement)?.id || ($event.target as HTMLElement)?.offsetParent?.id;
    const nextId = parseFloat(id?.indexOf('cdk-step-label-') === 0 ? id[id.length - 1] : undefined);
    if (!isNaN(nextId)) this.canLeaveStep(nextId - 1);
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
    else if (this.canLeaveStep(this.stepper.selectedIndex)) this.stepper?.next();
  }

  async exit() {
    if (this.canLeaveStep(-2)) {
      await this.updateRightHolders();
      this.snackBar.open($localize`Waterfall saved`, 'close', { duration: 3000 });
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  private canLeaveStep(nextStep: number) {
    if ((!this.contractForm.pristine && this.stepper.selectedIndex === 0 && nextStep !== -1) || (!this.canLeaveGraphForm && nextStep === -2)) {
      const subject = !this.contractForm.pristine ? $localize`Contracts Form` : $localize`Waterfall Builder`;
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: $localize`You are about to leave the ${subject}`,
          question: $localize`Some changes have not been saved. If you leave now, you might lose these changes`,
          cancel: $localize`Cancel`,
          confirm: $localize`Leave anyway`
        }, 'small'),
        autoFocus: false
      });
      dialogRef.afterClosed().subscribe((leave: boolean) => {
        if (leave) {
          this.contractForm.markAsPristine();
          this.stepper.selected.completed = true;
          this.canLeaveGraphForm = true;
          if (nextStep === -2) {
            this.router.navigate(['..'], { relativeTo: this.route });
          } else {
            this.stepper.selectedIndex = nextStep;
            this.stepper.next();
          }
        }
      });
      return false;
    } else {
      return true;
    }
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
    await this.waterfallService.update({ id: this.shell.waterfall.id, rightholders });

    this.rightholdersForm.markAsPristine();

    this.updating$.next(false);
  }

  displayGraph() {
    this.manualCreation$.next(true);
  }

  openIntercom() {
    return this.intercom.show($localize`I need help to create a waterfall`);
  }

  async publishWaterfall() {
    this.updating$.next(true);
    await this.shell.refreshWaterfall();
    this.updating$.next(false);
    this.snackBar.open(`Waterfall ${this.createMode ? $localize`Published` : $localize`Updated`}`, 'close', { duration: 3000 });
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  redirectToBuilder() {
    this.stepper.selectedIndex = 1;
    this.stepper.next();
  }

  public async simulate() {
    const mode = this.stateMode$.value === 'actual' ? 'simulation' : 'actual';
    if (mode === 'simulation') await this.shell.simulateWaterfall();
    this.stateMode$.next(mode);
  }
}
