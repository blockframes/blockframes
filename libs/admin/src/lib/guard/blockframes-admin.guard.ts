import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthService } from '@blockframes/auth/service';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BlockframesAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate() {
    return this.authService.isBlockframesAdmin$.pipe(
      switchMap(async isBlockframesAdmin => {
        if (isBlockframesAdmin) return true;
        await this.authService.signout();
        return this.router.createUrlTree(['/']);
      })
    )
  }
}
