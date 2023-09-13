// Angular
import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormArray, FormControl, FormGroup } from '@angular/forms';

// Blockframes
import { RightholderRole } from '@blockframes/model';
import { WaterfallDocumentForm } from './form/document.form';
import { MovieForm } from '@blockframes/movie/form/movie.form';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';


export interface WaterfallFormGuardedComponent {
  movieForm: MovieForm;
  documentForm: WaterfallDocumentForm;
  waterfallRoleControl: FormControl<RightholderRole[]>;
  rightholdersForm: FormArray<FormGroup<{ id: FormControl<string>, name: FormControl<string>, roles: FormControl<RightholderRole[]> }>>
};

@Injectable({ providedIn: 'root' })
export class WaterfallFormGuard<T extends WaterfallFormGuardedComponent> implements CanDeactivate<T>{

  constructor(
    private dialog: MatDialog,
  ) { }

  canDeactivate(component: T) {
    if (
      component.movieForm.pristine &&
      component.waterfallRoleControl.pristine &&
      component.rightholdersForm.pristine &&
      component.documentForm.pristine
    ) return true;
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
