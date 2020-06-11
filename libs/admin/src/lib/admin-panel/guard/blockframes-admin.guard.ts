import { Injectable } from '@angular/core';
import { AuthQuery } from '@blockframes/auth/+state/auth.query';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class BlockframesAdminGuard {
  constructor(
    private authQuery: AuthQuery,
    protected router: Router
  ) { }

  async canActivate() {
    const isBlockframesAdmin = this.authQuery.isBlockframesAdmin;
    if (isBlockframesAdmin) {
      return true;
    } else {
      return this.router.parseUrl('c/o');
    }
  }
}
