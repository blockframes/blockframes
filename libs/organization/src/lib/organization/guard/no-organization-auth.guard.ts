import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { map } from "rxjs/operators";
import { AuthService } from '@blockframes/auth/service';
import { combineLatest } from "rxjs";

@Injectable({ providedIn: 'root' })
export class NoOrganizationAuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user$,
      this.authService.anonymousCredentials$,
    ]).pipe(
      map(([userAuth]) => {
        const orgId = next.params.orgId;
        const queryParams = next.queryParams;

        if (!userAuth?.isAnonymous) return this.router.createUrlTree([`/organization/${orgId}/i`], { queryParams });

        return true;
      })
    );
  }
}
