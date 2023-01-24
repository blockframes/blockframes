import { Injectable } from '@angular/core';
import { switchMap, catchError, filter, tap } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { OrganizationService } from '@blockframes/organization/service';
import { CanActivate, Router, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { firstValueFrom, Subscription } from 'rxjs';
import { hasDisplayName } from '@blockframes/model';
import { createModalData } from '@blockframes/ui/global-modal/global-modal.component';
import { ConfirmComponent } from '@blockframes/ui/confirm/confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class OrganizationAuthGuard implements CanActivate, CanDeactivate<unknown> {
  private sub: Subscription;
  constructor(
    private authService: AuthService,
    private orgService: OrganizationService,
    private router: Router,
    private dialog: MatDialog,
  ) { }

  canActivate() {
    return this.authService.auth$.pipe(
      switchMap(async authState => {
        if (!authState) return this.router.createUrlTree(['/']);

        if (authState.isAnonymous) return true;

        const validUser = hasDisplayName(authState.profile) && authState.emailVerified && authState.profile.orgId;
        if (!validUser) return this.router.createUrlTree(['/auth/identity']);

        const org = await firstValueFrom(this.orgService.currentOrg$);
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);

        return true;
      }),
      catchError(() => this.router.navigate(['/'])),
      tap(canActivate => {
        if (canActivate === true) this.redirectOnSignout();
      })
    )
  }

  redirectOnSignout() {
    this.sub = this.authService.user$.pipe(
      filter(user => !user)
    ).subscribe(() => this.router.navigate(['/']));
  }

  async canDeactivate(
    _: unknown,
    __: ActivatedRouteSnapshot,
    ___: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ) {
    this.sub?.unsubscribe();

    const isAnonymous = await this.authService.isSignedInAnonymously();
    if (!isAnonymous) return true;

    // we don't show the confirm dialog if the user wants to go to homepage or identity page
    const nextPage = nextState.url.split('/').pop();
    if (['', 'identity', 'reset-password', 'connexion'].includes(nextPage)) return true;

    // If userId is undefined, that means the user has disconnected. If she/he wants to logout, we don't show the confirm message
    if (this.authService.uid === undefined) return true;

    const onClose = async (closedFrom?: 'button') => {
      this.dialog.closeAll();
      if (closedFrom === 'button') {
        return this.router.navigate(['/auth/connexion']);
      }
    };

    const dialogRef = this.dialog.open(ConfirmComponent, {
      data: createModalData({
        title: 'You\'re about to quit the public mode.',
        question: 'To access these details you need to be full registered.',
        confirm: 'Full register',
        cancel: 'I already have an account',
        onClose
      }),
      autoFocus: false
    });
    return firstValueFrom(dialogRef.afterClosed());

  }

}
