import { Inject, Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrganizationService } from '@blockframes/organization/service';
import { APP } from './utils';
import { App, Module } from '@blockframes/model';

function currentModule(path: string): Module {
  const fragments = path.split('/');
  return fragments.includes('dashboard') ? 'dashboard' : 'marketplace';
}

@Injectable({ providedIn: 'root' })
export class ModuleGuard {

  currentModule: Module;

  constructor(
    private router: Router,
    private orgService: OrganizationService,
    private snackBar: MatSnackBar,
    @Inject(APP) private app: App
  ) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const app = this.app;
    this.currentModule = currentModule(state.url);
    const org = this.orgService.org;
    if (this.currentModule === 'marketplace') {
      if (org.appAccess[app]?.marketplace) {
        return true;
      } else if (org.appAccess[app]?.dashboard) {
        return this.router.parseUrl('c/o/dashboard');
      } else {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return this.router.parseUrl('c/o/request-access');
      }
    } else {
      if (!org.appAccess[app]?.dashboard && org.appAccess[app]?.marketplace) {
        return this.router.parseUrl('c/o/marketplace');
      } else if (!org.appAccess[app]?.dashboard && !org.appAccess[app]?.marketplace) {
        this.snackBar.open('You don\'t have access to this application.', '', { duration: 5000 });
        return this.router.parseUrl('c/o/request-access');
      }
      return org.appAccess[app].dashboard;
    }
  }
}
