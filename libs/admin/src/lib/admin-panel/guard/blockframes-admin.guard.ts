import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Router, CanActivate } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class BlockframesAdminGuard implements CanActivate {
  constructor(
    private authQuery: AuthQuery,
    protected router: Router
  ) { }

  async canActivate() {
    return this.authQuery.isBlockframesAdmin
      ? true
      : this.router.parseUrl('c/o');
  }
}
