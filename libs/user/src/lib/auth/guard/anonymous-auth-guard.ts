import { Injectable } from '@angular/core';
import { CollectionGuardConfig } from 'akita-ng-fire';
import { AuthService } from '@blockframes/auth/+state';
import { CanActivate, CanDeactivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class AnonymousAuthGuard implements CanActivate, CanDeactivate<unknown> {
  constructor(
    private authService: AuthService
  ) { }

  /**
  * A simple guard that creates an anonymous account if user is not logged-in
  * This allow user to fetch documents in db by id.
   * @returns Promise<boolean>
  */
  async canActivate() {
    await this.authService.signInAnonymously();
    return true;
  }

  /**
   * Delete anonymous user when this leaving this guard
   * @returns boolean
   */
  canDeactivate() {
    this.authService.deleteAnonymousUser();
    return true;
  }

}
