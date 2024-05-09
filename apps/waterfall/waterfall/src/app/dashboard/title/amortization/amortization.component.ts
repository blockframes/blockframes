import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DashboardWaterfallShellComponent } from '@blockframes/waterfall/dashboard/shell/shell.component';
import { AmortizationService } from '@blockframes/waterfall/amortization.service';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';
import { Observable, combineLatest, map } from 'rxjs';
import { Amortization, WaterfallRightholder, sortByDate } from '@blockframes/model';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'waterfall-title-amortization',
  templateUrl: './amortization.component.html',
  styleUrls: ['./amortization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmortizationComponent {

  public producer = this.shell.waterfall.rightholders.find(r => r.roles.includes('producer'));

  public amortizations$: Observable<(Amortization & { rightholders: WaterfallRightholder[] })[]> = combineLatest([this.shell.amortizations$, this.shell.contracts$]).pipe(
    map(([amortizations, _contracts]) => sortByDate(amortizations, '_meta.createdAt').reverse().map(amortization => {
      const contracts = _contracts.filter(c => !!this.producer?.id && amortization.contractIds.includes(c.id));
      const rightholdersIds = contracts.map(c => c.buyerId === this.producer.id ? c.sellerId : c.buyerId);
      const rightholders = this.shell.waterfall.rightholders.filter(r => rightholdersIds.includes(r.id));
      return { ...amortization, rightholders };
    }))
  );

  constructor(
    private shell: DashboardWaterfallShellComponent,
    private dynTitle: DynamicTitleService,
    public service: AmortizationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.dynTitle.setPageTitle(this.shell.movie.title.international, $localize`Film Amortization`);
  }

  public async delete(amortizationId: string) {
    this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: $localize`Are you sure ?`,
        question: $localize`If you remove a Calculation that is already used in statements, problems might occur.`,
        confirm: $localize`Yes, remove Calculation.`,
        cancel: $localize`No, keep Calculation.`,
        onConfirm: async () => {
          await this.service.remove(amortizationId, { params: { waterfallId: this.shell.waterfall.id } });
          this.snackBar.open($localize`Calculation deleted.`, 'close', { duration: 5000 });
        }
      }, 'small'),
      autoFocus: false
    });
  }
}
