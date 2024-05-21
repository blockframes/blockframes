import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BehaviorSubject } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { rightholderName } from '@blockframes/waterfall/pipes/rightholder-name.pipe';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { Version } from '@blockframes/model';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ConfirmInputComponent } from '@blockframes/ui/confirm-input/confirm-input.component';

@Component({
  selector: 'crm-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent {
  public displayActions$ = new BehaviorSubject<boolean>(false);
  public displayWaterfall$ = new BehaviorSubject<boolean>(false);

  constructor(
    public shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.shell.setDate(undefined);
  }

  public removeVersion(id: string) {
    this.dialog.open(ConfirmInputComponent, {
      data: createModalData({
        title: 'You are about to delete this version from Waterfall ?',
        text: "If yes, please write 'DELETE' inside the form below.",
        warning: 'Doing this will could lead to a loss of data and broken pages.',
        confirmationWord: 'delete',
        confirmButtonText: 'delete',
        onConfirm: async () => {
          await this.shell.removeVersion(id);
          this.displayActions$.next(false);
          this.displayWaterfall$.next(false);
          this.snackBar.open(`Version "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
        }
      })
    });
  }

  public async duplicateVersion(versionId: string) {
    this.snackBar.open(`Creating version  from "${versionId}"... Please wait`, 'close');
    try {
      const newVersion = await this.shell.duplicateVersion(versionId);
      this.snackBar.open(`Version "${newVersion.id}" copied from ${versionId} !`, 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public setVersionAsDefault(version: Version) {
    if(version.default || version.standalone) return;
    return this.waterfallService.setVersionAsDefault(this.shell.waterfall, version.id);
  }

  public displayActions(versionId: string) {
    this.displayActions$.next(true);
    this.displayWaterfall$.next(false);
    this.shell.setVersionId(versionId);
  }

  public displayWaterfall(versionId: string) {
    this.displayActions$.next(false);
    this.displayWaterfall$.next(true);
    this.shell.setVersionId(versionId);
  }

  async refreshWaterfall(versionId: string){
    this.shell.setVersionId(versionId);
    await this.shell.refreshWaterfall();
    return this.snackBar.open(`Waterfall "${versionId}" refreshed`, 'close');
  }

  public getPayloadPair(from: string | { org?: string, income?: string, right?: string }) {
    if (!from) return '--';
    if (typeof from === 'string') return from;

    if (from?.org) return rightholderName(from.org, this.shell.waterfall);
    if (from?.income) return from.income;
    if (from?.right) return from.right;
  }

}