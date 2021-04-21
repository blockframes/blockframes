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
      map(user => {
        // Before we forced users to verify email, the user didnt have a createdAt value yet.
        // Therefore we still give access to these old users by checking if they have this value.
        if (!!user.profile._meta?.createdAt && !user.emailVerified) {
          return this.router.createUrlTree(['/auth/identity']);
        } else {
          return true;
        }
      })
    )
  }

}