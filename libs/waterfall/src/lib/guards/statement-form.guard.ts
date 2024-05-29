// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { map } from 'rxjs';

// Blockframes
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { StatementForm } from '../form/statement.form';
import { StatementService } from '../statement.service';

export interface StartementFormGuardedComponent {
  form: StatementForm;
};

@Injectable({ providedIn: 'root' })
export class StatementFormGuard<T extends StartementFormGuardedComponent> implements CanActivate, CanDeactivate<T>{
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private service: StatementService,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const waterfallId = next.paramMap.get('movieId');
    const statementId = next.paramMap.get('statementId');

    const currentPage = state.url.split('/').pop().split('?')[0];

    const isViewPage = currentPage === statementId;

    if (!statementId) this.router.parseUrl(`/c/o/dashboard/title/${waterfallId}/statements`);

    return this.service.valueChanges(statementId, { waterfallId }).pipe(
      map(statement => (statement.type !== 'producer' && statement.status === 'draft') || isViewPage || this.router.parseUrl(`/c/o/dashboard/title/${waterfallId}/statement/${statementId}`)),
    );
  }

  canDeactivate(component: T) {
    if (component.form.pristine) return true;
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
