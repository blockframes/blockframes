// Angular
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

// Blockframes
import { RightholderRole } from '@blockframes/model';
import { WaterfallContractForm } from './../form/contract.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


export interface WaterfallFormGuardedComponent {
  contractForm: WaterfallContractForm;
  rightholdersForm: FormArray<FormGroup<{ id: FormControl<string>, name: FormControl<string>, roles: FormControl<RightholderRole[]> }>>;
  canLeaveGraphForm: boolean;
};

@Injectable({ providedIn: 'root' })
export class WaterfallFormGuard<T extends WaterfallFormGuardedComponent> implements CanDeactivate<T> {

  constructor(
    private dialog: MatDialog,
  ) { }

  canDeactivate(component: T) {
    if (
      component.rightholdersForm.pristine &&
      component.contractForm.pristine &&
      component.canLeaveGraphForm
    ) return true;

    let subject = 'Contracts Form';
    if (!component.rightholdersForm) subject = 'Right Holders Form';
    if (!component.canLeaveGraphForm) subject = 'Waterfall Builder';
    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: $localize`You are about to leave the ${subject}`,
        question: $localize`Some changes have not been saved. If you leave now, you might lose these changes`,
        cancel: $localize`Cancel`,
        confirm: $localize`Leave anyway`
      }, 'small'),
      autoFocus: false
    });
    return dialogRef.afterClosed();
  }
}
