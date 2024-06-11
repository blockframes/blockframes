import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailVerifiedGuard {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate() {
    return this.authService.user$.pipe(
      map(user => user.emailVerified ? true : this.router.createUrlTree(['/auth/identity']))
    )
  }

}