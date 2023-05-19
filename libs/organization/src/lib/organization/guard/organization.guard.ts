import { Injectable } from '@angular/core';
import { OrganizationService } from '../service';
import { CanActivate, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { combineLatest } from 'rxjs';
import { AuthService } from '@blockframes/auth/service';
import { FirestoreService } from 'ngfire';
import { DocumentReference, getDoc } from 'firebase/firestore';
import { algoliaSearchKeyDoc } from '@blockframes/utils/maintenance';
import { IAlgoliaKeyDoc } from '@blockframes/model';
import { setSearchKey } from '@blockframes/utils/algolia';

@Injectable({ providedIn: 'root' })
export class OrganizationGuard implements CanActivate {
  constructor(
    private service: OrganizationService,
    private router: Router,
    private authService: AuthService,
    private firestore: FirestoreService,
  ) { }

  canActivate() {
    return combineLatest([
      this.authService.profile$,
      this.service.org$
    ]).pipe(
      switchMap(async ([user, org]) => {
        if (!user) return this.router.createUrlTree(['/']);
        if (!user.orgId || !org) return this.router.createUrlTree(['/auth/identity']);
        if (org.status !== 'accepted') return this.router.createUrlTree(['/c/organization/create-congratulations']);
        const doc = await getDoc(this.firestore.getRef(algoliaSearchKeyDoc) as DocumentReference<IAlgoliaKeyDoc>);
        setSearchKey(doc.data());
        return true;
      })
    );
  }
}
