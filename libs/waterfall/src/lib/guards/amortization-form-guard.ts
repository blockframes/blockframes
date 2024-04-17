// Angular
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

// Blockframes
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


export interface AmortizationFormGuardedComponent {
  canLeaveForm: boolean;
};

@Injectable({ providedIn: 'root' })
export class AmortizationFormGuard<T extends AmortizationFormGuardedComponent> implements CanDeactivate<T> {

  constructor(
    private dialog: MatDialog,
  ) { }

  canDeactivate(component: T) {
    if (component.canLeaveForm) return true;

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'You are about to leave the form',
        question: 'Some changes have not been saved. If you leave now, you might lose these changes',
        cancel: 'Cancel',
        confirm: 'Leave anyway'
      }, 'small'),
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}
