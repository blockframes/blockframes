import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PricePerCurrency, mainCurrency } from '@blockframes/model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { rightholderName } from '@blockframes/waterfall/pipes/rightholder-name.pipe';

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
    private snackBar: MatSnackBar
  ) {
    this.shell.setDate(undefined);
  }

  public getPrice(amount: number): PricePerCurrency {
    return { [mainCurrency]: amount };
  }

  public async removeVersion(id: string) {
    await this.shell.removeVersion(id);
    this.displayActions$.next(false);
    this.displayWaterfall$.next(false);
    this.snackBar.open(`Version "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
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

  public getPayloadPair(from: string | { org?: string, income?: string, right?: string }) {
    if (!from) return '--';
    if (typeof from === 'string') return from;

    if (from?.org) return rightholderName(from.org, this.shell.waterfall);
    if (from?.income) return from.income;
    if (from?.right) return from.right;
  }

}