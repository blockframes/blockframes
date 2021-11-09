import { Injectable } from '@angular/core';
import { CollectionGuardConfig } from 'akita-ng-fire';
import { AuthService } from '@blockframes/auth/+state';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
@CollectionGuardConfig({ awaitSync: true })
export class AnonymousAuthGuard implements CanActivate {
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

}
