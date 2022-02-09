import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../+state';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifiedGuard implements CanActivate  {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    return this.authService.authState$.pipe(
      map(user => user.emailVerified ? true : this.router.createUrlTree(['/auth/identity']))
    )
  }

}