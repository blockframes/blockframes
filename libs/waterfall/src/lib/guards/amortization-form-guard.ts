// Angular
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

// Blockframes
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { AmortizationForm } from '../form/amortization.form';

export interface AmortizationFormGuardedComponent {
  amortizationForm: AmortizationForm;
};

@Injectable({ providedIn: 'root' })
export class AmortizationFormGuard<T extends AmortizationFormGuardedComponent> {

  constructor(
    private dialog: MatDialog,
  ) { }

  canDeactivate(component: T) {
    if (component.amortizationForm.pristine) return true;

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: $localize`You are about to leave the form`,
        question: $localize`Some changes have not been saved. If you leave now, you might lose these changes`,
        cancel: $localize`Cancel`,
        confirm: $localize`Leave anyway`
      }, 'small'),
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}
