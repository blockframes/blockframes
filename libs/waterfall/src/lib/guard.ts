// Angular
import { Injectable } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { RightholderRole } from '@blockframes/model';

// Blockframes
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


export interface WaterfallFormGuardedComponent {
  movieForm: MovieForm;
  waterfallRoleControl: FormControl<RightholderRole[]>;
};

@Injectable({ providedIn: 'root' })
export class WaterfallFormGuard<T extends WaterfallFormGuardedComponent> implements CanDeactivate<T>{

  constructor(
    private dialog: MatDialog,
  ) { }

  canDeactivate(component: T) {
    if (component.movieForm.pristine && component.waterfallRoleControl.pristine) return true;
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
