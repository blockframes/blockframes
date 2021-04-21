import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthQuery } from '../+state';
import { map } from 'rxjs/operators';
import { toDate } from '@blockframes/utils/helpers';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifiedGuard implements CanActivate  {
  constructor(private authQuery: AuthQuery, private router: Router) {}

  canActivate() {
    return this.authQuery.select().pipe(
      map(user => {
        // Only since the specified date we enforce users to verify their email address.
        const isOld = !user.profile._meta || toDate(user.profile._meta.createdAt) < new Date('2021-05-31');
        if (!isOld && !user.emailVerified) {
          return this.router.createUrlTree(['/auth/identity']);
        } else {
          return true;
        }
      })
    )
  }

}