
// Angular
import { Component, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardWaterfallShellComponent } from '../shell/shell.component';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { MatStepper } from '@angular/material/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { AmortizationFormGuardedComponent } from '../../guards/amortization-form-guard';
import { AmortizationService } from '../../amortization.service';
import { createAmortization } from '@blockframes/model';

@Component({
  selector: 'waterfall-edit-amortization',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallEditAmortizationComponent implements AmortizationFormGuardedComponent {

  @ViewChild('stepper') stepper?: MatStepper;
  public movie = this.shell.movie;
  public amortizationId = this.route.snapshot.params.amortizationId;
  public updating$ = new BehaviorSubject(false);
  public canLeaveForm = false; // TODO #9753

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private shell: DashboardWaterfallShellComponent,
    private route: ActivatedRoute,
    private dynTitle: DynamicTitleService,
    private dialog: MatDialog,
    private service: AmortizationService
  ) {
    this.dynTitle.setPageTitle(this.movie.title.international, 'Film Amortization');
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
    // TODO #9753 if (this.stepper.selectedIndex === 1) await this.updateRightHolders();
    const end = this.stepper.selectedIndex === this.stepper.steps.length - 1;
    if (end) this.router.navigate(['..'], { relativeTo: this.route });
    else if (this.canLeaveStep(this.stepper.selectedIndex)) this.stepper?.next();
  }

  async exit() {
    if (this.canLeaveStep(-2)) {
      const amortization = createAmortization({ id: this.amortizationId, waterfallId: this.shell.waterfall.id });
      await this.service.upsert(amortization, { params: { waterfallId: this.shell.waterfall.id } });
      this.snackBar.open('Film Amortization saved', 'close', { duration: 3000 });
      this.router.navigate(['..'], { relativeTo: this.route });
    }
  }

  async save() {
    const amortization = createAmortization({ id: this.amortizationId, waterfallId: this.shell.waterfall.id });
    await this.service.upsert(amortization, { params: { waterfallId: this.shell.waterfall.id } });
    this.snackBar.open('Film Amortization saved', 'close', { duration: 3000 });
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  private canLeaveStep(nextStep: number) {
    if (!this.canLeaveForm) {
      const dialogRef = this.dialog.open(ConfirmComponent, {
        data: createModalData({
          title: 'You are about to leave the form',
          question: 'Some changes have not been saved. If you leave now, you might lose these changes',
          cancel: 'Cancel',
          confirm: 'Leave anyway'
        }, 'small'),
        autoFocus: false
      });
      dialogRef.afterClosed().subscribe((leave: boolean) => {
        if (leave) {
          if (nextStep === -2) {
            this.router.navigate(['../..'], { relativeTo: this.route });
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
}