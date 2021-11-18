import { Injectable } from '@angular/core';
import { AuthService } from '@blockframes/auth/+state';
import { CanActivate } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AnonymousAuthGuard implements CanActivate {
  constructor(
    private authService: AuthService
  ) { }

  async canActivate() {
    await this.authService.signInAnonymously();
    return true;
  }

}
