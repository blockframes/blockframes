import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '../+state';

@Injectable({ providedIn: 'root' })
export class UserRedirectionGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) { }

  async canActivate() {
    const user = await this.authService.auth.currentUser;
    // If user is not logged in, stay on the page
    if (!user || user.isAnonymous) return true;

    // Else, navigate to 'c/o' where other guards will take care of redirection
    return this.router.parseUrl(`c/o`);
  }
}
