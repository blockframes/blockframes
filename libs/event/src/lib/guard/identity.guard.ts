import { Injectable } from '@angular/core';
import { EventService } from '../service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { AuthService } from '@blockframes/auth/service';
import { combineLatest } from 'rxjs';
import { hasAnonymousIdentity } from '@blockframes/model';

@Injectable({ providedIn: 'root' })
export class IdentityGuard {

  constructor(
    private service: EventService,
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(next: ActivatedRouteSnapshot) {
    return combineLatest([
      this.authService.user$,
      this.authService.anonymousCredentials$,
      this.service.valueChanges(next.params.eventId as string)
    ]).pipe(
      map(([userAuth, creds, event]) => {
        if (userAuth && !userAuth.isAnonymous) return true;

        if (!creds?.role) return this.router.createUrlTree([`/event/${event.id}/auth/role`], { queryParams: next.queryParams });

        if (creds.role === 'organizer' || event.accessibility === 'private') return this.router.createUrlTree([`/event/${event.id}/auth/login`], { queryParams: next.queryParams });

        const page = event.accessibility === 'protected' ? 'email' : 'identity';
        if (creds.role && !hasAnonymousIdentity(creds, event.accessibility)) return this.router.createUrlTree([`/event/${event.id}/auth/${page}`], { queryParams: next.queryParams });

        return true;
      })
    );
  }
}
