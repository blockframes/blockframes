import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PricePerCurrency, mainCurrency } from '@blockframes/model';
import { WaterfallService } from '@blockframes/waterfall/waterfall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';

@Component({
  selector: 'crm-waterfall',
  templateUrl: './waterfall.component.html',
  styleUrls: ['./waterfall.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaterfallComponent {
  public waterfall$ = this.shell.waterfall$;
  public incomes$ = this.shell.incomes$;
  public contracts$ = this.shell.contracts$;
  public state$ = this.shell.state$;
  public canInitWaterfall$ = this.shell.canInitWaterfall$;
  public hasMinimalRights$ = this.shell.hasMinimalRights$;
  public displayActions$ = new BehaviorSubject<boolean>(false);
  public displayWaterfall$ = new BehaviorSubject<boolean>(false);
  public actions$ = this.shell.actions$;

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private waterfallService: WaterfallService,
    private snackBar: MatSnackBar
  ) { }

  public getRightholderName(id: string) {
    if (!id) return '--';
    return this.shell.waterfall.rightholders.find(r => r.id === id)?.name || '--';
  }

  public getPrice(amount: number): PricePerCurrency {
    return { [mainCurrency]: amount };
  }

  public async initWaterfall() {
    const versionNumber = this.shell.waterfall.versions.length + 1;
    const versionId = `version_${versionNumber}`;
    this.snackBar.open(`Creating version "${versionId}"... Please wait`, 'close');
    await this.waterfallService.initWaterfall(this.shell.waterfall.id, { id: versionId, description: `Version ${versionNumber}` });
    this.snackBar.open(`Version "${versionId}" initialized !`, 'close', { duration: 5000 });
  }

  public async removeVersion(id: string) {
    await this.waterfallService.removeVersion(this.shell.waterfall.id, id);
    this.displayActions$.next(false);
    this.displayWaterfall$.next(false);
    this.snackBar.open(`Version "${id}" deleted from waterfall !`, 'close', { duration: 5000 });
  }

  public async duplicateVersion(id: string) {
    this.snackBar.open(`Creating version  from "${id}"... Please wait`, 'close');
    try {
      const newVersion = await this.waterfallService.duplicateVersion(this.shell.waterfall.id, id);
      this.snackBar.open(`Version "${newVersion.id}" copied from ${id} !`, 'close', { duration: 5000 });
    } catch (error) {
      this.snackBar.open(error.message, 'close', { duration: 5000 });
    }
  }

  public displayActions(versionId: string) {
    this.displayActions$.next(true);
    this.displayWaterfall$.next(false);
    this.shell.versionId$.next(versionId);
  }

  public displayWaterfall(versionId: string) {
    this.displayActions$.next(false);
    this.displayWaterfall$.next(true);
    this.shell.versionId$.next(versionId);
  }

  public getPayloadPair(from: string | { org?: string, income?: string, right?: string }) {
    if (!from) return '--';
    if (typeof from === 'string') return from;

    if (from?.org) return this.getRightholderName(from.org);
    if (from?.income) return from.income;
    if (from?.right) return from.right;
  }

}