import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthQuery } from '../+state';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifiedGuard implements CanActivate  {
  constructor(private authQuery: AuthQuery, private router: Router) {}

  canActivate() {
    return this.authQuery.select().pipe(
      map(user => user.emailVerified ? true : this.router.createUrlTree(['/auth/identity']))
    )
  }

}