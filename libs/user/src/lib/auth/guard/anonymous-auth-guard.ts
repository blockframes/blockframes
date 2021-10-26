import { Injectable } from '@angular/core';
import { CollectionGuardConfig } from 'akita-ng-fire';
import { AngularFireAuth } from '@angular/fire/auth';
import { AuthService } from '@blockframes/auth/+state';
import { CanActivate, CanDeactivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class AnonymousAuthGuard implements CanActivate, CanDeactivate<unknown> {
  constructor(
    private authService: AuthService,
    private afAuth: AngularFireAuth
  ) { }

  /**
  * A simple guard that creates an anonymous account if user is not logged-in
  * This allow user to fetch documents in db by id.
   * @returns Promise<boolean>
  */
  async canActivate() {
    const currentUser = await this.afAuth.currentUser;
    if (!currentUser) {
      await this.authService.signInAnonymously();
    }
    return true;
  }

  /**
   * Delete anonymous user when this leaving this guard
   * @returns Promise<boolean>
   */
  async canDeactivate() {
    await this.authService.deleteAnonymousUser();
    return true;
  }

}
